package com.andrea360.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "member_credits",
        uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "fitness_service_id"})
)
@Getter
@Setter
public class MemberCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fitness_service_id", nullable = false)
    private FitnessService fitnessService;

    @Column(nullable = false)
    private int availableCredits;
}