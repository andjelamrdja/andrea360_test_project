package com.andrea360.backend.dto.fitness_service;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateFitnessServiceRequest {

    @NotBlank
    @Size(max = 120)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    @Min(1)
    private Integer durationMinutes;

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal price;

    private Boolean active; // optional (defaults to true)
}