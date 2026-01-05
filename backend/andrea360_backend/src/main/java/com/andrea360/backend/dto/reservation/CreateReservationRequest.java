package com.andrea360.backend.dto.reservation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReservationRequest {

    @NotNull
    private Long memberId;

    @NotNull
    private Long sessionId;

    // optional (if you already paid and want to link payment)
    private Long paymentId;

    @Size(max = 200)
    private String note;
}