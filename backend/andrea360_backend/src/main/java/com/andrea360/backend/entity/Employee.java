package com.andrea360.backend.entity;

import com.andrea360.backend.entity.enums.EmployeeAuthRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "employees",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_employee_email", columnNames = "email")
        }
)
@Getter
@Setter
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String firstName;

    @Column(nullable = false, length = 80)
    private String lastName;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(nullable = false, length = 60)
    private String role; // keep as-is if you want (job role)

    // Authorization role (ADMIN or EMPLOYEE)
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_role", nullable = false, length = 30)
    private EmployeeAuthRole authRole = EmployeeAuthRole.EMPLOYEE;

//    //  For authentication (store bcrypt hash)
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_employee_location"))
    private Location location;

//    @Column(name = "password_hash", nullable = false)
//    private String password;

}