package com.andrea360.backend.repository;

import com.andrea360.backend.entity.FitnessService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FitnessServiceRepository extends JpaRepository<FitnessService, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @Query("""
   select fs
   from FitnessService fs
   join fetch fs.location
   where fs.active = true
   order by fs.name asc
""")
    List<FitnessService> findAllActiveWithLocation();
}
