package com.andrea360.backend.security;

import com.andrea360.backend.entity.Employee;
import com.andrea360.backend.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentEmployee {

    public Employee require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof EmployeePrincipal p)) {
            throw new BusinessException("Not authenticated.");
        }
        return p.getEmployee();
    }
}