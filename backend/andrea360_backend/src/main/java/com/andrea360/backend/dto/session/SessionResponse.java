package com.andrea360.backend.dto.session;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {

    private Long id;

    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;

    private Integer capacity;
    private String status;

    private Long locationId;
    private String locationName;

    private Long fitnessServiceId;
    private String fitnessServiceName;

    private Long trainerEmployeeId;
    private String trainerName;
}