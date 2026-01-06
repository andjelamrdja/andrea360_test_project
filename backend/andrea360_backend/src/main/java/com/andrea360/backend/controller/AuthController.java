package com.andrea360.backend.controller;

import com.andrea360.backend.dto.auth.AuthMeResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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

        return new AuthMeResponse(
                auth.getName(),
                userType,
                authRole,
                roles
        );
    }
}
