package com.andrea360.backend.controller;

import com.andrea360.backend.dto.location.CreateLocationRequest;
import com.andrea360.backend.dto.location.LocationResponse;
import com.andrea360.backend.dto.location.UpdateLocationRequest;
import com.andrea360.backend.service.EmployeeService;
import com.andrea360.backend.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;
    private final EmployeeService employeeService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocationResponse create(@Valid @RequestBody CreateLocationRequest request) {
        return locationService.create(request);
    }

    @PutMapping("/{id}")
    public LocationResponse update(@PathVariable Long id,
                                   @Valid @RequestBody UpdateLocationRequest request) {
        return locationService.update(id, request);
    }

    @GetMapping("/{id}")
    public LocationResponse getById(@PathVariable Long id) {
        return locationService.getById(id);
    }

    @GetMapping
    public List<LocationResponse> getAll() {
        return locationService.getAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        locationService.delete(id);
    }
}
