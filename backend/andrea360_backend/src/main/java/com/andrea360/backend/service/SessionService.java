package com.andrea360.backend.service;

import com.andrea360.backend.dto.session.CreateSessionRequest;
import com.andrea360.backend.dto.session.SessionResponse;
import com.andrea360.backend.dto.session.UpdateSessionRequest;

import java.util.List;

public interface SessionService {

    SessionResponse create(CreateSessionRequest request);

    SessionResponse update(Long id, UpdateSessionRequest request);

    SessionResponse getById(Long id);

    List<SessionResponse> getAll();

    void delete(Long id);
}
