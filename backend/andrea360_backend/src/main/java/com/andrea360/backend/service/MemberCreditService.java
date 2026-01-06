package com.andrea360.backend.service;

import com.andrea360.backend.entity.MemberCredit;

public interface MemberCreditService {
    MemberCredit getOrCreate(Long memberId, Long fitnessServiceId);

    void addCredits(Long memberId, Long fitnessServiceId, int amount);

    void consumeCredits(Long memberId, Long fitnessServiceId, int amount);

    void consumeCredit(Long memberId, Long fitnessServiceId);
}