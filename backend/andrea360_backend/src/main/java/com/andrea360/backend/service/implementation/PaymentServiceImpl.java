package com.andrea360.backend.service.implementation;

import com.andrea360.backend.config.StripeConfig;
import com.andrea360.backend.dto.payment.CreatePaymentRequest;
import com.andrea360.backend.dto.payment.PaymentResponse;
import com.andrea360.backend.dto.payment.UpdatePaymentRequest;
import com.andrea360.backend.dto.stripe.CreateCheckoutSessionRequest;
import com.andrea360.backend.dto.stripe.CreateCheckoutSessionResponse;
import com.andrea360.backend.entity.FitnessService;
import com.andrea360.backend.entity.Member;
import com.andrea360.backend.entity.Payment;
import com.andrea360.backend.entity.enums.PaymentMethod;
import com.andrea360.backend.entity.enums.PaymentStatus;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.FitnessServiceRepository;
import com.andrea360.backend.repository.MemberRepository;
import com.andrea360.backend.repository.PaymentRepository;
import com.andrea360.backend.service.MemberCreditService;
import com.andrea360.backend.service.PaymentService;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final FitnessServiceRepository fitnessServiceRepository;
    private final MemberCreditService memberCreditService;
    private final StripeConfig stripeConfig;


    @Override
    public PaymentResponse create(CreatePaymentRequest request) {

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new NotFoundException("Member not found: " + request.getMemberId()));

        FitnessService fitnessService = fitnessServiceRepository.findById(request.getFitnessServiceId())
                .orElseThrow(() -> new NotFoundException("FitnessService not found: " + request.getFitnessServiceId()));

        Payment p = new Payment();
        p.setMember(member);
        p.setFitnessService(fitnessService);

        int qty = (request.getQuantity() == null) ? 1 : request.getQuantity();
        if (qty < 1) {
            throw new BusinessException("Quantity must be at least 1.");
        }
        p.setQuantity(qty);

        BigDecimal amount = request.getAmount();
        if (amount == null) {
            amount = fitnessService.getPrice().multiply(BigDecimal.valueOf(qty));
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than 0.");
        }
        p.setAmount(amount);

        String currency = (request.getCurrency() == null || request.getCurrency().isBlank())
                ? "EUR"
                : request.getCurrency().toUpperCase();
        p.setCurrency(currency);

        p.setMethod(PaymentMethod.ONLINE);

// TEST MODE: instantly paid
        p.setStatus(PaymentStatus.PAID);
        p.setCreatedAt(OffsetDateTime.now());
        p.setPaidAt(OffsetDateTime.now());

// optional but useful in test mode
        p.setExternalRef("TEST-" + java.util.UUID.randomUUID());

        Payment saved = paymentRepository.save(p);

        applyCreditsIfNeeded(saved);


        Payment full = paymentRepository.findByIdFull(saved.getId())
                .orElseThrow(() -> new NotFoundException("Payment not found after save: " + saved.getId()));

        return map(full);
    }

    @Override
    public PaymentResponse update(Long id, UpdatePaymentRequest request) {
        Payment existing = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));

        // allow admin to change status (controller restricts it)
        if (request.getStatus() != null && request.getStatus() != existing.getStatus()) {
            existing.setStatus(request.getStatus());

            if (request.getStatus() == PaymentStatus.PAID) {
                if (existing.getPaidAt() == null) {
                    existing.setPaidAt(OffsetDateTime.now());
                }
                applyCreditsIfNeeded(existing);
            }
            // Optional: if setting away from PAID, you can null paidAt (depends on your audit needs)
            // else if (existing.getStatus() != PaymentStatus.PAID) { existing.setPaidAt(null); }
        }

        // keep your existing fields logic
        if (request.getExternalRef() != null && !request.getExternalRef().isBlank()) {
            String newRef = request.getExternalRef().trim();
            if (existing.getExternalRef() == null || !existing.getExternalRef().equals(newRef)) {
                if (paymentRepository.existsByExternalRef(newRef)) {
                    throw new BusinessException("externalRef already exists: " + newRef);
                }
            }
            existing.setExternalRef(newRef);
        }

        if (request.getQuantity() != null) {
            if (request.getQuantity() < 1) throw new BusinessException("Quantity must be at least 1.");
            existing.setQuantity(request.getQuantity());
        }

        if (request.getAmount() != null) {
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) throw new BusinessException("Amount must be greater than 0.");
            existing.setAmount(request.getAmount());
        }

        if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
            existing.setCurrency(request.getCurrency().trim().toUpperCase());
        }

        Payment saved = paymentRepository.save(existing);
        return map(saved);
    }


    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getById(Long id) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));
        return map(p);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream()
                .map(this::map)
                .toList();
    }

    @Override
    public PaymentResponse markAsPaid(Long id) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));

        if (p.getStatus() != PaymentStatus.PAID) {
            p.setStatus(PaymentStatus.PAID);
            p.setPaidAt(OffsetDateTime.now());
        }

        applyCreditsIfNeeded(p);

        p = paymentRepository.save(p);
        return map(p);
    }

    @Override
    public void markPaidFromStripe(Payment payment, Session session) {

        // 🔒 Idempotency protection
        if (payment.getStatus() == PaymentStatus.PAID) {
            return;
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(OffsetDateTime.now());

        // (optional) save Stripe references
        // payment.setStripePaymentIntentId(session.getPaymentIntent());

        applyCreditsIfNeeded(payment);

        paymentRepository.save(payment);
    }

    @Override
    public void delete(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new NotFoundException("Payment not found: " + id);
        }
        paymentRepository.deleteById(id);
    }

    private PaymentResponse map(Payment p) {

        var member = p.getMember();
        var service = p.getFitnessService();

        // ✅ Use service location (it is required in your entity)
        var loc = service != null ? service.getLocation() : null;

        String memberName = member == null
                ? null
                : ((member.getFirstName() == null ? "" : member.getFirstName()) + " " +
                (member.getLastName() == null ? "" : member.getLastName())).trim();

        return new PaymentResponse(
                p.getId(),
                member != null ? member.getId() : null,
                memberName,

                loc != null ? loc.getId() : null,
                loc != null ? loc.getName() : null,

                service != null ? service.getId() : null,
                service != null ? service.getName() : null,

                p.getAmount(),
                p.getCurrency(),
                p.getMethod(),
                p.getStatus(),
                p.getCreatedAt(),
                p.getPaidAt(),
                p.getExternalRef(),
                p.getQuantity(),
                p.isCreditsApplied(),
                null
        );
    }
    @Override
    public CreateCheckoutSessionResponse createStripeCheckoutSession(CreateCheckoutSessionRequest req, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Member not found: " + memberId));

        FitnessService fitnessService = fitnessServiceRepository.findById(req.fitnessServiceId())
                .orElseThrow(() -> new NotFoundException("FitnessService not found: " + req.fitnessServiceId()));

        int qty = (req.quantity() == null) ? 1 : req.quantity();
        if (qty < 1) throw new BusinessException("Quantity must be at least 1.");

        String currency = (req.currency() == null || req.currency().isBlank()) ? "eur" : req.currency().toLowerCase();

        // Save internal payment as PENDING (important!)
        Payment p = new Payment();
        p.setMember(member);
        p.setFitnessService(fitnessService);
        p.setQuantity(qty);
        p.setCurrency(currency.toUpperCase());
        p.setMethod(PaymentMethod.ONLINE);
        p.setStatus(PaymentStatus.PENDING);
        p.setCreatedAt(OffsetDateTime.now());

        BigDecimal amount = fitnessService.getPrice().multiply(BigDecimal.valueOf(qty));
        p.setAmount(amount);

        Payment saved = paymentRepository.save(p);

        // Stripe uses smallest currency unit (cents). Be careful with decimals.
        long unitAmountCents = fitnessService.getPrice().movePointRight(2).longValueExact();

        var params =
                com.stripe.param.checkout.SessionCreateParams.builder()
                        .setMode(com.stripe.param.checkout.SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl(stripeConfig.getSuccessUrl())
                        .setCancelUrl(stripeConfig.getCancelUrl())
                        .addLineItem(
                                com.stripe.param.checkout.SessionCreateParams.LineItem.builder()
                                        .setQuantity((long) qty)
                                        .setPriceData(
                                                com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.builder()
                                                        .setCurrency(currency)
                                                        .setUnitAmount(unitAmountCents)
                                                        .setProductData(
                                                                com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                        .setName(fitnessService.getName() + " credit")
                                                                        .build())
                                                        .build())
                                        .build())
                        // metadata to reconnect Stripe -> your DB later
                        .putMetadata("paymentId", String.valueOf(saved.getId()))
                        .putMetadata("memberId", String.valueOf(memberId))
                        .putMetadata("fitnessServiceId", String.valueOf(fitnessService.getId()))
                        .putMetadata("quantity", String.valueOf(qty))
                        .build();

        com.stripe.model.checkout.Session session;
        try {
            session = com.stripe.model.checkout.Session.create(params);
        } catch (Exception e) {
            throw new BusinessException("Stripe session creation failed: " + e.getMessage());
        }

        // store session id as externalRef so webhook can find it
        saved.setExternalRef(session.getId());
        paymentRepository.save(saved);

        return new CreateCheckoutSessionResponse(session.getUrl(), session.getId(), saved.getId());
    }

    @Override
    public PaymentResponse confirmStripeCheckout(String sessionId) {

        // 1) find your Payment by externalRef = Stripe session id
        Payment payment = paymentRepository.findByExternalRef(sessionId)
                .orElseThrow(() -> new NotFoundException("Payment not found for session: " + sessionId));

        // 2) fetch session from Stripe (server-side, safe)
        Session session;
        try {
            session = Session.retrieve(sessionId);
        } catch (Exception e) {
            throw new BusinessException("Cannot retrieve Stripe session: " + e.getMessage());
        }

        // 3) verify it is paid
        String status = session.getPaymentStatus(); // "paid", "unpaid", "no_payment_required"
        if (!"paid".equals(status)) {
            // keep it pending (or set FAILED/CANCELLED based on your rules)
            return map(payment);
        }

        // 4) mark as paid + apply credits
        if (payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(OffsetDateTime.now());
            applyCreditsIfNeeded(payment);
            paymentRepository.save(payment);
        }

        Payment full = paymentRepository.findByIdFull(payment.getId()).orElse(payment);
        return map(full);
    }

    private void applyCreditsIfNeeded(Payment p) {
        if (p.getStatus() == PaymentStatus.PAID && !p.isCreditsApplied()) {
            int qty = (p.getQuantity() == null) ? 1 : p.getQuantity();

            memberCreditService.addCredits(
                    p.getMember().getId(),
                    p.getFitnessService().getId(),
                    qty
            );

            p.setCreditsApplied(true);
        }
    }

}