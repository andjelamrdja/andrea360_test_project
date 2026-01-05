package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.reservation.CreateReservationRequest;
import com.andrea360.backend.dto.reservation.ReservationResponse;
import com.andrea360.backend.dto.reservation.UpdateReservationRequest;
import com.andrea360.backend.entity.Member;
import com.andrea360.backend.entity.Payment;
import com.andrea360.backend.entity.Reservation;
import com.andrea360.backend.entity.Session;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.MemberRepository;
import com.andrea360.backend.repository.PaymentRepository;
import com.andrea360.backend.repository.ReservationRepository;
import com.andrea360.backend.repository.SessionRepository;
import com.andrea360.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final MemberRepository memberRepository;
    private final SessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public ReservationResponse create(CreateReservationRequest request) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new NotFoundException("Member not found: " + request.getMemberId()));

        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new NotFoundException("Session not found: " + request.getSessionId()));

        if (reservationRepository.existsByMemberIdAndSessionId(member.getId(), session.getId())) {
            throw new BusinessException("Member already has a reservation for this session.");
        }

        ensureCapacity(session.getId(), session.getCapacity());

        Payment payment = null;
        if (request.getPaymentId() != null) {
            payment = paymentRepository.findById(request.getPaymentId())
                    .orElseThrow(() -> new NotFoundException("Payment not found: " + request.getPaymentId()));
        }

        Reservation r = new Reservation();
        r.setMember(member);
        r.setSession(session);
        r.setPayment(payment);
        r.setStatus("CREATED");
        r.setCreatedAt(OffsetDateTime.now());
        r.setNote(request.getNote());

        Reservation saved = reservationRepository.save(r);
        return map(saved);
    }

    @Override
    public ReservationResponse update(Long id, UpdateReservationRequest request) {
        Reservation existing = reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservation not found: " + id));

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new NotFoundException("Member not found: " + request.getMemberId()));

        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new NotFoundException("Session not found: " + request.getSessionId()));

        // if member/session changed -> enforce uniqueness
        boolean changedMemberOrSession =
                !existing.getMember().getId().equals(member.getId()) ||
                        !existing.getSession().getId().equals(session.getId());

        if (changedMemberOrSession) {
            if (reservationRepository.existsByMemberIdAndSessionId(member.getId(), session.getId())) {
                throw new BusinessException("Member already has a reservation for this session.");
            }
            ensureCapacity(session.getId(), session.getCapacity());
        }

        Payment payment = null;
        if (request.getPaymentId() != null) {
            payment = paymentRepository.findById(request.getPaymentId())
                    .orElseThrow(() -> new NotFoundException("Payment not found: " + request.getPaymentId()));
        }

        existing.setMember(member);
        existing.setSession(session);
        existing.setPayment(payment);
        existing.setNote(request.getNote());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            existing.setStatus(request.getStatus().trim().toUpperCase());
            if ("CANCELLED".equals(existing.getStatus()) && existing.getCancelledAt() == null) {
                existing.setCancelledAt(OffsetDateTime.now());
            }
        }

        Reservation saved = reservationRepository.save(existing);
        return map(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getById(Long id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservation not found: " + id));
        return map(r);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAll() {
        return reservationRepository.findAll().stream().map(this::map).toList();
    }

    @Override
    public ReservationResponse confirm(Long id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservation not found: " + id));

        if ("CANCELLED".equalsIgnoreCase(r.getStatus())) {
            throw new BusinessException("Cancelled reservation cannot be confirmed.");
        }

        // confirm should still respect capacity (if others reserved in the meantime)
        ensureCapacity(r.getSession().getId(), r.getSession().getCapacity(), id);

        r.setStatus("CONFIRMED");
        Reservation saved = reservationRepository.save(r);
        return map(saved);
    }

    @Override
    public ReservationResponse cancel(Long id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservation not found: " + id));

        if (!"CANCELLED".equalsIgnoreCase(r.getStatus())) {
            r.setStatus("CANCELLED");
            r.setCancelledAt(OffsetDateTime.now());
            r = reservationRepository.save(r);
        }

        return map(r);
    }

    @Override
    public void delete(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new NotFoundException("Reservation not found: " + id);
        }
        reservationRepository.deleteById(id);
    }

    private void ensureCapacity(Long sessionId, Integer sessionCapacity) {
        ensureCapacity(sessionId, sessionCapacity, null);
    }

    /**
     * If confirming/updating existing reservation, you can exclude current reservation id from capacity checks if needed.
     * For simplicity, we only count CONFIRMED reservations as taking capacity.
     */
    private void ensureCapacity(Long sessionId, Integer sessionCapacity, Long currentReservationId) {
        if (sessionCapacity == null) return; // if you don't have capacity defined, don't block

        long confirmedCount = reservationRepository.countBySessionIdAndStatus(sessionId, "CONFIRMED");

        // If confirming the current reservation and it is already confirmed, don't block
        // (This avoids weird double-count situations in some flows.)
        // We'll keep it simple: block only if confirmedCount >= capacity.
        if (confirmedCount >= sessionCapacity) {
            throw new BusinessException("Session is full. No more reservations available.");
        }
    }

    private ReservationResponse map(Reservation r) {
        Long paymentId = (r.getPayment() != null) ? r.getPayment().getId() : null;
        String paymentStatus = (r.getPayment() != null) ? r.getPayment().getStatus() : null;

        // Member full name is optional
        String fullName = null;
        try {
            // If your Member has getFirstName/getLastName this will work; if not, keep null.
            String fn = (String) Member.class.getMethod("getFirstName").invoke(r.getMember());
            String ln = (String) Member.class.getMethod("getLastName").invoke(r.getMember());
            if (fn != null || ln != null) fullName = (fn == null ? "" : fn) + " " + (ln == null ? "" : ln);
            if (fullName != null) fullName = fullName.trim();
        } catch (Exception ignored) {
        }

        return new ReservationResponse(
                r.getId(),
                r.getMember().getId(),
                fullName,
                r.getSession().getId(),
                r.getSession().getStartsAt(), // adjust if your field name differs
                paymentId,
                paymentStatus,
                r.getStatus(),
                r.getCreatedAt(),
                r.getCancelledAt(),
                r.getNote()
        );
    }
}