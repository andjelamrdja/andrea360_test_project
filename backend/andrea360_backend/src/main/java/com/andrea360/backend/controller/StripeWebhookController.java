package com.andrea360.backend.controller;

import com.andrea360.backend.config.StripeConfig;
import com.andrea360.backend.entity.Payment;
import com.andrea360.backend.repository.PaymentRepository;
import com.andrea360.backend.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private final StripeConfig stripeConfig;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader // <-- MUST be in quotes
    ) {
        final Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeConfig.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(400).body("Invalid Stripe signature");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Webhook error: " + e.getMessage());
        }

        if ("checkout.session.completed".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            StripeObject obj = deserializer.getObject().orElse(null);

            if (obj instanceof com.stripe.model.checkout.Session stripeSession) {
                String stripeSessionId = stripeSession.getId(); // cs_test_...

                Payment payment = paymentRepository.findByExternalRef(stripeSessionId).orElse(null);
                if (payment != null) {
                    paymentService.markPaidFromStripe(payment, stripeSession);
                }
            }
        }

        return ResponseEntity.ok("ok");
    }
}
