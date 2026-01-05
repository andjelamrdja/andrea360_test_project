package com.andrea360.backend.dto.session;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class CreateSessionRequest {

    @NotNull
    private OffsetDateTime startsAt;

    @NotNull
    private OffsetDateTime endsAt;

    @NotNull
    @Min(1)
    private Integer capacity;

    @NotNull
    private Long locationId;

    @NotNull
    private Long fitnessServiceId;

    @NotNull
    private Long trainerEmployeeId;
}