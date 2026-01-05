package com.andrea360.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "reservations",
        uniqueConstraints = {
                // One member can reserve a given session only once
                @UniqueConstraint(name = "uq_reservation_member_session", columnNames = {"member_id", "session_id"})
        }
)
@Getter
@Setter
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_reservation_member"))
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_reservation_session"))
    private Session session;

    // optional: reservation can be backed by a payment
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id",
            foreignKey = @ForeignKey(name = "fk_reservation_payment"))
    private Payment payment;

    @Column(nullable = false, length = 30)
    private String status; // CREATED / CONFIRMED / CANCELLED

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    private OffsetDateTime cancelledAt;

    @Column(length = 200)
    private String note;
}
