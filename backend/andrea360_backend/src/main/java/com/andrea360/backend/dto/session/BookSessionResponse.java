package com.andrea360.backend.dto.session;

public record BookSessionResponse(
        Long reservationId,
        Long sessionId,
        Integer currentBookings,
        Integer remainingCreditsForService
) {}