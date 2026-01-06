package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Session;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {

    @Query("""
        select count(s) > 0
        from Session s
        where s.trainer.id = :trainerId
          and s.id <> coalesce(:excludeId, -1)
          and s.startsAt < :endsAt
          and s.endsAt > :startsAt
    """)
    boolean existsTrainerOverlap(Long trainerId, OffsetDateTime startsAt, OffsetDateTime endsAt, Long excludeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Session s where s.id = :id")
    Optional<Session> findByIdForUpdate(@Param("id") Long id);


}