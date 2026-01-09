package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Session;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
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
    boolean existsTrainerOverlap(
            @Param("trainerId") Long trainerId,
            @Param("startsAt") OffsetDateTime startsAt,
            @Param("endsAt") OffsetDateTime endsAt,
            @Param("excludeId") Long excludeId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Session s where s.id = :id")
    Optional<Session> findByIdForUpdate(@Param("id") Long id);

    @Query("""
        select s
        from Session s
        join fetch s.location
        join fetch s.fitnessService fs
        where lower(s.status) = 'scheduled'
        order by s.startsAt asc
    """)
    List<Session> findScheduledForMemberBooking();

    @Query("""
        select s
        from Session s
        join fetch s.location
        join fetch s.fitnessService fs
        where lower(s.status) = 'scheduled'
          and fs.id = :fitnessServiceId
        order by s.startsAt asc
    """)
    List<Session> findScheduledForMemberBookingByService(@Param("fitnessServiceId") Long fitnessServiceId);

    @Query("""
        select s
        from Session s
        join fetch s.location
        join fetch s.fitnessService fs
        where lower(s.status) = 'scheduled'
          and function('date', s.startsAt) = :date
        order by s.startsAt asc
    """)
    List<Session> findScheduledForMemberBookingByDate(@Param("date") LocalDate date);

    @Query("""
        select s
        from Session s
        join fetch s.location
        join fetch s.fitnessService fs
        where lower(s.status) = 'scheduled'
          and fs.id = :fitnessServiceId
          and function('date', s.startsAt) = :date
        order by s.startsAt asc
    """)
    List<Session> findScheduledForMemberBookingByServiceAndDate(
            @Param("fitnessServiceId") Long fitnessServiceId,
            @Param("date") LocalDate date
    );
}