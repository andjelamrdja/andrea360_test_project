package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByExternalRef(String externalRef);
}
