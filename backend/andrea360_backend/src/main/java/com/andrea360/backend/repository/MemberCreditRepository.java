package com.andrea360.backend.repository;

import com.andrea360.backend.entity.MemberCredit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberCreditRepository extends JpaRepository<MemberCredit, Long> {

    Optional<MemberCredit> findByMemberIdAndFitnessServiceId(Long memberId, Long fitnessServiceId);
}