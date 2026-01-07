package com.andrea360.backend.dto.payment;

import com.andrea360.backend.entity.enums.PaymentMethod;
import com.andrea360.backend.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;

    private Long memberId;
    private String memberName;
    private Long locationId;
    private String locationName;

    private Long fitnessServiceId;
    private String fitnessServiceName;

    private BigDecimal amount;
    private String currency;

    private PaymentMethod method;
    private PaymentStatus status;

    private OffsetDateTime createdAt;
    private OffsetDateTime paidAt;

    private String externalRef;

    private Integer quantity;
    private boolean creditsApplied;

    private String checkoutUrl;
}
