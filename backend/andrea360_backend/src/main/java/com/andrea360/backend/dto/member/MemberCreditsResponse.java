package com.andrea360.backend.dto.member;

import java.util.List;

public record MemberCreditsResponse(
        Long memberId,
        Integer totalCredits,
        List<ServiceCreditsItem> creditsByService
) {
    public record ServiceCreditsItem(
            Long fitnessServiceId,
            String fitnessServiceName,
            int availableCredits
    ) {}
}