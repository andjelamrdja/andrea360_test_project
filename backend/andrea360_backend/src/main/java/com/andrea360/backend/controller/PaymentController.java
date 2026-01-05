package com.andrea360.backend.controller;

import com.andrea360.backend.dto.payment.CreatePaymentRequest;
import com.andrea360.backend.dto.payment.PaymentResponse;
import com.andrea360.backend.dto.payment.UpdatePaymentRequest;
import com.andrea360.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.create(request);
    }

    @PutMapping("/{id}")
    public PaymentResponse update(@PathVariable Long id, @Valid @RequestBody UpdatePaymentRequest request) {
        return paymentService.update(id, request);
    }

    @GetMapping("/{id}")
    public PaymentResponse getById(@PathVariable Long id) {
        return paymentService.getById(id);
    }

    @GetMapping
    public List<PaymentResponse> getAll() {
        return paymentService.getAll();
    }

    @PatchMapping("/{id}/mark-paid")
    public PaymentResponse markPaid(@PathVariable Long id) {
        return paymentService.markAsPaid(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        paymentService.delete(id);
    }
}