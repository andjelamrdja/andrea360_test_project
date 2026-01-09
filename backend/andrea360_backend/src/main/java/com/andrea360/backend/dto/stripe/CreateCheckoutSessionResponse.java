package com.andrea360.backend.dto.stripe;

public record CreateCheckoutSessionResponse(
        String url,
        String sessionId,
        Long paymentId
) {}