package com.andrea360.backend.dto.payment;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdatePaymentRequest {

    @Size(max = 120)
    private String externalRef;

    @Min(1)
    private Integer quantity;

    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @Size(max = 10)
    private String currency;

}