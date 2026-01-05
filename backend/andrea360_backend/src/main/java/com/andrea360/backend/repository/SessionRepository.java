package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;

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
}