package com.andrea360.backend.service;

import com.andrea360.backend.dto.payment.CreatePaymentRequest;
import com.andrea360.backend.dto.payment.PaymentResponse;
import com.andrea360.backend.dto.payment.UpdatePaymentRequest;
import com.andrea360.backend.dto.stripe.CreateCheckoutSessionRequest;
import com.andrea360.backend.dto.stripe.CreateCheckoutSessionResponse;
import com.andrea360.backend.entity.Payment;
import com.stripe.model.checkout.Session;

import java.util.List;

public interface PaymentService {

    PaymentResponse create(CreatePaymentRequest request);

    PaymentResponse update(Long id, UpdatePaymentRequest request);

    PaymentResponse getById(Long id);

    List<PaymentResponse> getAll();

    PaymentResponse markAsPaid(Long id);

    void delete(Long id);


    CreateCheckoutSessionResponse createStripeCheckoutSession(
            CreateCheckoutSessionRequest request,
            Long memberId
    );

    void markPaidFromStripe(Payment payment, Session session);

    PaymentResponse confirmStripeCheckout(String sessionId);

}