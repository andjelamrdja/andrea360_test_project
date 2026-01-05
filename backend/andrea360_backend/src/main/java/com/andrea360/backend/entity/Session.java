package com.andrea360.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "sessions")
@Getter
@Setter
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // When the session starts/ends
    @Column(nullable = false)
    private OffsetDateTime startsAt;

    @Column(nullable = false)
    private OffsetDateTime endsAt;

    // Maximum number of participants
    @Column(nullable = false)
    private Integer capacity;

    // Optional: status (kept simple as String for now)
    @Column(nullable = false, length = 30)
    private String status; // e.g. "SCHEDULED", "CANCELLED"

    // Relations
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_session_location"))
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fitness_service_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_session_fitness_service"))
    private FitnessService fitnessService;

    // Trainer / employee running the session
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_employee_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_session_trainer_employee"))
    private Employee trainer;
}
