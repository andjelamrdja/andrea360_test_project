package com.andrea360.backend.controller;

import com.andrea360.backend.dto.payment.CreatePaymentRequest;
import com.andrea360.backend.dto.payment.PaymentResponse;
import com.andrea360.backend.dto.payment.UpdatePaymentRequest;
import com.andrea360.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.create(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public PaymentResponse update(@PathVariable Long id, @Valid @RequestBody UpdatePaymentRequest request) {
        return paymentService.update(id, request);
    }

    @PreAuthorize("hasAnyRole('MEMBER','ADMIN','EMPLOYEE')")
    @GetMapping("/{id}")
    public PaymentResponse getById(@PathVariable Long id) {
        return paymentService.getById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    @GetMapping
    public List<PaymentResponse> getAll() {
        return paymentService.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
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