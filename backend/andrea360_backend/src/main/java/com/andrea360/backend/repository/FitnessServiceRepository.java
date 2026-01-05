package com.andrea360.backend.repository;

import com.andrea360.backend.entity.FitnessService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FitnessServiceRepository extends JpaRepository<FitnessService, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
