package com.andrea360.backend.dto.reservation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {

    private Long id;

    private Long memberId;
    private String memberFullName; // optional if you have it

    private Long sessionId;
    private OffsetDateTime sessionStartsAt;

    private Long paymentId; // nullable
    private String paymentStatus; // nullable

    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime cancelledAt;

    private String note;
}