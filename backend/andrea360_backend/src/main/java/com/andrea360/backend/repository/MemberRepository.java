package com.andrea360.backend.repository;

import com.andrea360.backend.entity.Employee;
import com.andrea360.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    Optional<Member> findByEmailIgnoreCase(String email);
}
