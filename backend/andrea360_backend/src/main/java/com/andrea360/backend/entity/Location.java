package com.andrea360.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "locations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_locations_name_address", columnNames = {"name", "address"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 200)
    private String address;
}