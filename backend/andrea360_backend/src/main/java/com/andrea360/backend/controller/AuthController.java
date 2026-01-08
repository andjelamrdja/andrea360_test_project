package com.andrea360.backend.controller;

import com.andrea360.backend.dto.auth.AuthMeResponse;
import com.andrea360.backend.entity.Employee;
import com.andrea360.backend.entity.Member;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.EmployeeRepository;
import com.andrea360.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EmployeeRepository employeeRepository;
    private final MemberRepository memberRepository;

    @GetMapping("/me")
    public AuthMeResponse me(Authentication auth) {
        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        // Determine type by role
        String userType = roles.contains("ROLE_MEMBER") ? "MEMBER" : "EMPLOYEE";

        String authRole = null;
        if (roles.contains("ROLE_ADMIN")) authRole = "ADMIN";
        else if (roles.contains("ROLE_EMPLOYEE")) authRole = "EMPLOYEE";
        else if (roles.contains("ROLE_MEMBER")) authRole = "MEMBER";

        boolean isMember = roles.contains("ROLE_MEMBER");

        Long employeeId = null;
        Long memberId = null;
        Long locationId = null;

        String email = auth.getName();

        if (isMember) {
            Member m = memberRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new NotFoundException("Member not found for email: " + email));
            memberId = m.getId();
            locationId = m.getLocation().getId();
        } else {
            Employee e = employeeRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new NotFoundException("Employee not found for email: " + email));
            employeeId = e.getId();
            locationId = e.getLocation().getId();
        }

        return new AuthMeResponse(
                auth.getName(),
                userType,
                authRole,
                roles,
                employeeId,
                memberId,
                locationId
        );
    }
}
