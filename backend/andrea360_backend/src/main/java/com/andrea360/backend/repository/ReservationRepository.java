package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    boolean existsByMemberIdAndSessionIdAndStatusIn(Long memberId, Long sessionId, Collection<String> statuses);

    long countBySessionIdAndStatusIn(Long sessionId, Collection<String> statuses);
    @Query("""
        select r.session.id as sessionId, count(r.id) as cnt
        from Reservation r
        where r.session.id in :sessionIds
          and r.status in :statuses
        group by r.session.id
    """)
    List<Object[]> countBySessionIdsAndStatuses(List<Long> sessionIds, List<String> statuses);

    @Query("""
      select r
      from Reservation r
      join fetch r.session s
      join fetch s.fitnessService fs
      join fetch s.location loc
      where r.member.id = :memberId
      order by s.startsAt desc
    """)
    List<Reservation> findAllByMemberIdWithDetails(@Param("memberId") Long memberId);

}