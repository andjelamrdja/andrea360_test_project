package com.andrea360.backend.service;

import com.andrea360.backend.entity.Employee;
import com.andrea360.backend.entity.Member;
import com.andrea360.backend.repository.EmployeeRepository;
import com.andrea360.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;
    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Employee e = employeeRepository.findByEmailIgnoreCase(email).orElse(null);
        if (e != null) {
            return User.withUsername(e.getEmail())
                    .password(e.getPasswordHash())
                    .roles(e.getAuthRole().name()) // ADMIN / EMPLOYEE
                    .build();
        }

        Member m = memberRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return User.withUsername(m.getEmail())
                .password(m.getPasswordHash())
                .roles("MEMBER")
                .build();
    }
}