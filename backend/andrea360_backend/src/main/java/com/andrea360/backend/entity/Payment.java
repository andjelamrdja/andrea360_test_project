package com.andrea360.backend.entity;

import com.andrea360.backend.entity.enums.PaymentMethod;
import com.andrea360.backend.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // who paid
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_payment_member"))
    private Member member;

    // what is being paid for
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fitness_service_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_payment_fitness_service"))
    private FitnessService fitnessService;

    // optional: payment can be tied to a specific session
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id",
            foreignKey = @ForeignKey(name = "fk_payment_session"))
    private Session session;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency; // "EUR", "BAM"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    private OffsetDateTime paidAt;

    // optional external provider reference (Stripe payment intent id etc)
    @Column(length = 120, unique = true)
    private String externalRef;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false)
    private boolean creditsApplied = false;
}
