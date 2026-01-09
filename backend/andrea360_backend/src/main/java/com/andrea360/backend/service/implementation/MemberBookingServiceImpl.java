package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.member.MemberCreditsResponse;
import com.andrea360.backend.dto.member.MemberSessionCardResponse;
import com.andrea360.backend.dto.session.BookSessionResponse;
import com.andrea360.backend.entity.MemberCredit;
import com.andrea360.backend.entity.Reservation;
import com.andrea360.backend.entity.Session;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.MemberCreditRepository;
import com.andrea360.backend.repository.ReservationRepository;
import com.andrea360.backend.repository.SessionRepository;
import com.andrea360.backend.service.MemberBookingService;
import com.andrea360.backend.service.MemberCreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class MemberBookingServiceImpl implements MemberBookingService {

    private final MemberCreditRepository memberCreditRepository;
    private final ReservationRepository reservationRepository;
    private final SessionRepository sessionRepository;
    private final MemberCreditService memberCreditService;

    private static final List<String> ACTIVE_RESERVATION_STATUSES = List.of("CREATED", "CONFIRMED");

    @Override
    @Transactional(readOnly = true)
    public MemberCreditsResponse getMyCredits(Long memberId) {
        Integer total = memberCreditRepository.sumCreditsByMemberId(memberId);
        if (total == null) total = 0;

        List<MemberCredit> credits = memberCreditRepository.findAllByMemberIdWithService(memberId);

        List<MemberCreditsResponse.ServiceCreditsItem> items = credits.stream()
                .map(mc -> new MemberCreditsResponse.ServiceCreditsItem(
                        mc.getFitnessService().getId(),
                        mc.getFitnessService().getName(),
                        mc.getAvailableCredits()
                ))
                .toList();

        return new MemberCreditsResponse(memberId, total, items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberSessionCardResponse> getAvailableSessions(Long memberId, Long fitnessServiceId, LocalDate date) {
        List<Session> sessions;
        if (fitnessServiceId != null && date != null) {
            sessions = sessionRepository.findScheduledForMemberBookingByServiceAndDate(fitnessServiceId, date);
        } else if (fitnessServiceId != null) {
            sessions = sessionRepository.findScheduledForMemberBookingByService(fitnessServiceId);
        } else if (date != null) {
            sessions = sessionRepository.findScheduledForMemberBookingByDate(date);
        } else {
            sessions = sessionRepository.findScheduledForMemberBooking();
        }

        if (sessions.isEmpty()) return List.of();

        List<Long> sessionIds = sessions.stream().map(Session::getId).toList();

        Map<Long, Integer> bookingsBySession = reservationRepository
                .countBySessionIdsAndStatuses(sessionIds, ACTIVE_RESERVATION_STATUSES)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Long) row[1]).intValue()
                ));

        return sessions.stream().map(s -> {
            int currentBookings = bookingsBySession.getOrDefault(s.getId(), 0);

            return new MemberSessionCardResponse(
                    s.getId(),
                    s.getStartsAt(),
                    s.getEndsAt(),
                    s.getCapacity(),
                    currentBookings,
                    s.getLocation().getId(),
                    s.getLocation().getName(),
                    s.getFitnessService().getId(),
                    s.getFitnessService().getName(),
                    null
            );
        }).toList();
    }

    @Override
    public BookSessionResponse bookSession(Long memberId, Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found: " + sessionId));

        if (!"SCHEDULED".equalsIgnoreCase(session.getStatus())) {
            throw new BusinessException("Session is not available for booking.");
        }

        if (reservationRepository.existsByMemberIdAndSessionIdAndStatusIn(
                memberId, sessionId, ACTIVE_RESERVATION_STATUSES)) {
            throw new BusinessException("You already booked this session.");
        }


        // capacity check
        int currentBookings = (int) reservationRepository.countBySessionIdAndStatusIn(sessionId, ACTIVE_RESERVATION_STATUSES);
        if (currentBookings >= session.getCapacity()) {
            throw new BusinessException("Session is full.");
        }

        Long serviceId = session.getFitnessService().getId();
        memberCreditService.consumeCredit(memberId, serviceId);

        Reservation r = new Reservation();
        var mRef = new com.andrea360.backend.entity.Member();
        mRef.setId(memberId);
        r.setMember(mRef);

        r.setSession(session);
        r.setStatus("CREATED");
        r.setCreatedAt(OffsetDateTime.now());
        Reservation saved = reservationRepository.save(r);

        MemberCredit mc = memberCreditRepository
                .findByMemberIdAndFitnessServiceId(memberId, serviceId)
                .orElse(null);

        int remaining = mc != null ? mc.getAvailableCredits() : 0;

        return new BookSessionResponse(
                saved.getId(),
                sessionId,
                currentBookings + 1,
                remaining
        );
    }
}