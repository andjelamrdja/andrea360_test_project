package com.andrea360.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
public class DevController {
    private final PasswordEncoder encoder;

    @GetMapping("/hash")
    public String hash(@RequestParam String password) {
        return encoder.encode(password);
    }
}