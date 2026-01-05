package com.andrea360.backend.service;

import com.andrea360.backend.dto.fitness_service.CreateFitnessServiceRequest;
import com.andrea360.backend.dto.fitness_service.FitnessServiceResponse;
import com.andrea360.backend.dto.fitness_service.UpdateFitnessServiceRequest;

import java.util.List;

public interface FitnessServiceService {
    FitnessServiceResponse create(CreateFitnessServiceRequest request);
    FitnessServiceResponse update(Long id, UpdateFitnessServiceRequest request);
    FitnessServiceResponse getById(Long id);
    List<FitnessServiceResponse> getAll();
    void delete(Long id);
}
