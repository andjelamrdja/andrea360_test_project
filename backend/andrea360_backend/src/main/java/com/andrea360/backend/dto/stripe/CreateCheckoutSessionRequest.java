package com.andrea360.backend.dto.stripe;

public record CreateCheckoutSessionRequest(
        Long fitnessServiceId,
        Integer quantity,
        String currency
) {}