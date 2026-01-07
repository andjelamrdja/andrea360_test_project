package com.andrea360.backend.repository;

import com.andrea360.backend.entity.MemberCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MemberCreditRepository extends JpaRepository<MemberCredit, Long> {

    Optional<MemberCredit> findByMemberIdAndFitnessServiceId(Long memberId, Long fitnessServiceId);

    @Query("select coalesce(sum(mc.availableCredits), 0) from MemberCredit mc where mc.member.id = :memberId")
    Integer sumCreditsByMemberId(@Param("memberId") Long memberId);
}