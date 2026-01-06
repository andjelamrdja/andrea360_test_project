package com.andrea360.backend.dto.auth;

import java.util.List;

public record AuthMeResponse(
        String email,
        String userType,   // "EMPLOYEE" or "MEMBER"
        String authRole,   // "ADMIN"/"EMPLOYEE"/null
        List<String> authorities
) {}