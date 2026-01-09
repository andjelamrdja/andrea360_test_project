package com.andrea360.backend.controller;

import com.andrea360.backend.dto.payment.CreatePaymentRequest;
import com.andrea360.backend.dto.payment.PaymentResponse;
import com.andrea360.backend.dto.payment.UpdatePaymentRequest;
import com.andrea360.backend.dto.stripe.CreateCheckoutSessionRequest;
import com.andrea360.backend.dto.stripe.CreateCheckoutSessionResponse;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.MemberRepository;
import com.andrea360.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final MemberRepository memberRepository;

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

    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/stripe/checkout-session")
    public CreateCheckoutSessionResponse createCheckoutSession(
            @RequestBody CreateCheckoutSessionRequest req,
            @AuthenticationPrincipal UserDetails user
    ) {
        String email = user.getUsername();

        Long memberId = memberRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NotFoundException("Member not found for email: " + email))
                .getId();

        return paymentService.createStripeCheckoutSession(req, memberId);
    }

    @PreAuthorize("hasRole('MEMBER')")
    @GetMapping("/stripe/confirm")
    public PaymentResponse confirmStripe(@RequestParam("sessionId") String sessionId) {
        return paymentService.confirmStripeCheckout(sessionId);
    }

}