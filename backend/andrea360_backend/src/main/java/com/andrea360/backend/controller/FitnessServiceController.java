package com.andrea360.backend.controller;

import com.andrea360.backend.dto.fitness_service.CreateFitnessServiceRequest;
import com.andrea360.backend.dto.fitness_service.FitnessServiceResponse;
import com.andrea360.backend.dto.fitness_service.UpdateFitnessServiceRequest;
import com.andrea360.backend.service.FitnessServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/fitness-services")
public class FitnessServiceController {

    private final FitnessServiceService fitnessServiceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FitnessServiceResponse create(@Valid @RequestBody CreateFitnessServiceRequest request) {
        return fitnessServiceService.create(request);
    }

    @PutMapping("/{id}")
    public FitnessServiceResponse update(@PathVariable Long id,
                                         @Valid @RequestBody UpdateFitnessServiceRequest request) {
        return fitnessServiceService.update(id, request);
    }

    @GetMapping("/{id}")
    public FitnessServiceResponse getById(@PathVariable Long id) {
        return fitnessServiceService.getById(id);
    }

    @GetMapping
    public List<FitnessServiceResponse> getAll() {
        return fitnessServiceService.getAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        fitnessServiceService.delete(id);
    }
}