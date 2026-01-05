package com.andrea360.backend.dto.member;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateMemberRequest {

    @NotBlank
    @Size(max = 80)
    private String firstName;

    @NotBlank
    @Size(max = 80)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 160)
    private String email;

    @Size(max = 30)
    private String phone;

    @NotNull
    @Past(message = "dateOfBirth must be in the past")
    private LocalDate dateOfBirth;

    @NotNull
    private Long locationId;
}
