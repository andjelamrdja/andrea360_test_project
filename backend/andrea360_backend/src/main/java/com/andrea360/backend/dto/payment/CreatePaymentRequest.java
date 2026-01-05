package com.andrea360.backend.dto.payment;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotNull
    private Long memberId;

    @NotNull
    private Long fitnessServiceId;

    // Optional: allow custom quantity (default = 1)
    @Min(1)
    private Integer quantity;

    // Optional: if not sent -> "EUR"
    @Size(max = 10)
    private String currency;

    // Optional: if not sent -> computed from service price * quantity
    @DecimalMin(value = "0.01")
    private BigDecimal amount;
}