package com.andrea360.backend.service;

import com.andrea360.backend.dto.member.MemberCreditsResponse;
import com.andrea360.backend.dto.member.MemberSessionCardResponse;
import com.andrea360.backend.dto.session.BookSessionResponse;

import java.time.LocalDate;
import java.util.List;

public interface MemberBookingService {
    MemberCreditsResponse getMyCredits(Long memberId);
    List<MemberSessionCardResponse> getAvailableSessions(Long memberId, Long fitnessServiceId, LocalDate date);
    BookSessionResponse bookSession(Long memberId, Long sessionId);
}