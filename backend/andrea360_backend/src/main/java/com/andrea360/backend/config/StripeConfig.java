package com.andrea360.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import com.stripe.Stripe;

@Configuration
@Getter
public class StripeConfig {
    @Value("${stripe.secretKey}") private String secretKey;
    @Value("${stripe.webhookSecret}") private String webhookSecret;
    @Value("${stripe.successUrl}") private String successUrl;
    @Value("${stripe.cancelUrl}") private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }
}

