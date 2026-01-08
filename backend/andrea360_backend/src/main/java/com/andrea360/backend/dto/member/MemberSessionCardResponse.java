package com.andrea360.backend.dto.member;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record MemberSessionCardResponse(
        Long sessionId,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt,

        Integer capacity,
        Integer currentBookings,

        Long locationId,
        String locationName,

        Long fitnessServiceId,
        String fitnessServiceName,

        BigDecimal price // optional; can be null if you don’t store it
) {}