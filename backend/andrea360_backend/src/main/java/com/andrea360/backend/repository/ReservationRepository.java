package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    boolean existsByMemberIdAndSessionId(Long memberId, Long sessionId);
    long countBySessionIdAndStatus(Long sessionId, String status);
}