package com.andrea360.backend.service.implementation;

import com.andrea360.backend.entity.FitnessService;
import com.andrea360.backend.entity.Member;
import com.andrea360.backend.entity.MemberCredit;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.FitnessServiceRepository;
import com.andrea360.backend.repository.MemberCreditRepository;
import com.andrea360.backend.repository.MemberRepository;
import com.andrea360.backend.service.MemberCreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberCreditServiceImpl implements MemberCreditService {

    private final MemberCreditRepository memberCreditRepository;
    private final MemberRepository memberRepository;
    private final FitnessServiceRepository fitnessServiceRepository;

    @Override
    public MemberCredit getOrCreate(Long memberId, Long fitnessServiceId) {
        if (memberId == null) throw new BusinessException("memberId is required.");
        if (fitnessServiceId == null) throw new BusinessException("fitnessServiceId is required.");

        return memberCreditRepository
                .findByMemberIdAndFitnessServiceId(memberId, fitnessServiceId)
                .orElseGet(() -> {
                    Member member = memberRepository.findById(memberId)
                            .orElseThrow(() -> new NotFoundException("Member not found: " + memberId));

                    FitnessService service = fitnessServiceRepository.findById(fitnessServiceId)
                            .orElseThrow(() -> new NotFoundException("FitnessService not found: " + fitnessServiceId));

                    MemberCredit mc = new MemberCredit();
                    mc.setMember(member);
                    mc.setFitnessService(service);
                    mc.setAvailableCredits(0);
                    return memberCreditRepository.save(mc);
                });
    }

    @Override
    public void addCredits(Long memberId, Long fitnessServiceId, int amount) {
        if (amount <= 0) throw new BusinessException("Credit amount must be positive.");

        MemberCredit mc = getOrCreate(memberId, fitnessServiceId);
        mc.setAvailableCredits(mc.getAvailableCredits() + amount);
        memberCreditRepository.save(mc);
    }

    @Override
    public void consumeCredits(Long memberId, Long fitnessServiceId, int amount) {
        if (amount <= 0) throw new BusinessException("Credit amount must be positive.");

        MemberCredit mc = getOrCreate(memberId, fitnessServiceId);

        if (mc.getAvailableCredits() < amount) {
            throw new BusinessException("Member does not have enough credits for this service.");
        }

        mc.setAvailableCredits(mc.getAvailableCredits() - amount);
        memberCreditRepository.save(mc);
    }

    @Override
    public void consumeCredit(Long memberId, Long fitnessServiceId) {
        consumeCredits(memberId, fitnessServiceId, 1);
    }
}