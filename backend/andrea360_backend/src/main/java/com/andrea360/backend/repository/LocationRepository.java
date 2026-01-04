package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findByNameAndAddress(String name, String address);

    boolean existsByNameAndAddress(String name, String address);
}