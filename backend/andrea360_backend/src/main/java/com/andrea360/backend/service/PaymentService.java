package com.andrea360.backend.service;

import com.andrea360.backend.dto.payment.CreatePaymentRequest;
import com.andrea360.backend.dto.payment.PaymentResponse;
import com.andrea360.backend.dto.payment.UpdatePaymentRequest;

import java.util.List;

public interface PaymentService {

    PaymentResponse create(CreatePaymentRequest request);

    PaymentResponse update(Long id, UpdatePaymentRequest request);

    PaymentResponse getById(Long id);

    List<PaymentResponse> getAll();

    PaymentResponse markAsPaid(Long id);

    void delete(Long id);
}