package com.andrea360.backend.controller;

import com.andrea360.backend.dto.session.CreateSessionRequest;
import com.andrea360.backend.dto.session.SessionResponse;
import com.andrea360.backend.dto.session.UpdateSessionRequest;
import com.andrea360.backend.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse create(@Valid @RequestBody CreateSessionRequest request) {
        return sessionService.create(request);
    }

    @PutMapping("/{id}")
    public SessionResponse update(@PathVariable Long id,
                                  @Valid @RequestBody UpdateSessionRequest request) {
        return sessionService.update(id, request);
    }

    @GetMapping("/{id}")
    public SessionResponse getById(@PathVariable Long id) {
        return sessionService.getById(id);
    }

    @GetMapping
    public List<SessionResponse> getAll() {
        return sessionService.getAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        sessionService.delete(id);
    }
}
