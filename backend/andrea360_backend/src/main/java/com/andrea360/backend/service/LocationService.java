package com.andrea360.backend.service;

import com.andrea360.backend.dto.location.CreateLocationRequest;
import com.andrea360.backend.dto.location.LocationResponse;
import com.andrea360.backend.dto.location.UpdateLocationRequest;

import java.util.List;

public interface LocationService {
    LocationResponse create(CreateLocationRequest request);

    LocationResponse update(Long id, UpdateLocationRequest request);

    LocationResponse getById(Long id);

    List<LocationResponse> getAll();

    void delete(Long id);
}
