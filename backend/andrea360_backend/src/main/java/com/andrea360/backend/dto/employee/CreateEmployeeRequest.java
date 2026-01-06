package com.andrea360.backend.dto.employee;

import com.andrea360.backend.entity.enums.EmployeeAuthRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateEmployeeRequest {

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

    private String password;
    private EmployeeAuthRole authRole;

    @NotNull
    private Long locationId;
}