package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.payment.CreatePaymentRequest;
import com.andrea360.backend.dto.payment.PaymentResponse;
import com.andrea360.backend.dto.payment.UpdatePaymentRequest;
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
        p.setStatus(PaymentStatus.PENDING);
        p.setCreatedAt(OffsetDateTime.now());

        Payment saved = paymentRepository.save(p);
        return map(saved);
    }

    @Override
    public PaymentResponse update(Long id, UpdatePaymentRequest request) {

        Payment existing = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));

        // 1) Once PAID, don't allow modifications (keeps audit + prevents weird states)
        if (existing.getStatus() == PaymentStatus.PAID) {
            throw new BusinessException("Paid payments cannot be updated.");
        }

        // 2) External reference is allowed (Stripe session/payment intent id)
        if (request.getExternalRef() != null && !request.getExternalRef().isBlank()) {
            String newRef = request.getExternalRef().trim();
            if (existing.getExternalRef() == null || !existing.getExternalRef().equals(newRef)) {
                if (paymentRepository.existsByExternalRef(newRef)) {
                    throw new BusinessException("externalRef already exists: " + newRef);
                }
            }
            existing.setExternalRef(newRef);
        }

        // 3) Only allow changing quantity/amount/currency while PENDING (optional)
        if (request.getQuantity() != null) {
            if (request.getQuantity() < 1) {
                throw new BusinessException("Quantity must be at least 1.");
            }
            existing.setQuantity(request.getQuantity());
        }

        if (request.getAmount() != null) {
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Amount must be greater than 0.");
            }
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
    public void delete(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new NotFoundException("Payment not found: " + id);
        }
        paymentRepository.deleteById(id);
    }

    private PaymentResponse map(Payment p) {

        return new PaymentResponse(
                p.getId(),
                p.getMember().getId(),
                p.getFitnessService().getId(),
                p.getFitnessService().getName(),
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

    private void applyCreditsIfNeeded(Payment p) {
        if ("PAID".equalsIgnoreCase(p.getStatus().name()) && !p.isCreditsApplied()) {
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