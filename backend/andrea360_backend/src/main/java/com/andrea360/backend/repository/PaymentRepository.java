package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByExternalRef(String externalRef);
    @Query("""
        select p from Payment p
        join fetch p.member m
        join fetch p.fitnessService fs
        join fetch fs.location
        where p.id = :id
    """)
    Optional<Payment> findByIdFull(Long id);
}
