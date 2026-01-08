package com.andrea360.backend.controller;

import com.andrea360.backend.dto.member.MemberCreditsResponse;
import com.andrea360.backend.dto.member.MemberSessionCardResponse;
import com.andrea360.backend.dto.session.BookSessionResponse;
import com.andrea360.backend.service.MemberBookingService;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/member")
public class MemberBookingController {

    private final MemberBookingService memberBookingService;

    // You can also inject a small helper that reads memberId from Authentication.
    // Since you already have /api/auth/me, easiest is: frontend calls /me then uses memberId.
    // But backend can also read from Authentication directly if you prefer.

    @PreAuthorize("hasRole('MEMBER')")
    @GetMapping("/credits")
    public MemberCreditsResponse myCredits(@RequestParam Long memberId) {
        // Minimal approach with memberId param (works now).
        // Better approach is /me resolved from auth; we can refactor after.
        return memberBookingService.getMyCredits(memberId);
    }

    @PreAuthorize("hasRole('MEMBER')")
    @GetMapping("/sessions")
    public List<MemberSessionCardResponse> availableSessions(
            @RequestParam Long memberId,
            @RequestParam(required = false) Long fitnessServiceId,
            @RequestParam(required = false)
            @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "date must be YYYY-MM-DD")
            String date
    ) {
        LocalDate d = (date == null || date.isBlank()) ? null : LocalDate.parse(date);
        return memberBookingService.getAvailableSessions(memberId, fitnessServiceId, d);
    }

    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/sessions/{sessionId}/book")
    public BookSessionResponse book(
            @RequestParam Long memberId,
            @PathVariable Long sessionId
    ) {
        return memberBookingService.bookSession(memberId, sessionId);
    }
}