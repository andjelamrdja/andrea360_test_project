package com.andrea360.backend.dto.reservation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateReservationRequest {

    @NotNull
    private Long memberId;

    @NotNull
    private Long sessionId;

    private Long paymentId;

    @Size(max = 200)
    private String note;

    // allow updating status explicitly if you want
    @Size(max = 30)
    private String status; // CREATED / CONFIRMED / CANCELLED
}