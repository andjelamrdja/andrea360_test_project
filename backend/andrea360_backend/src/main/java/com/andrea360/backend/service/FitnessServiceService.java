package com.andrea360.backend.service;

import com.andrea360.backend.dto.fitness_service.CreateFitnessServiceRequest;
import com.andrea360.backend.dto.fitness_service.FitnessServiceResponse;
import com.andrea360.backend.dto.fitness_service.UpdateFitnessServiceRequest;

import java.util.List;

public interface FitnessServiceService {
    FitnessServiceResponse create(CreateFitnessServiceRequest request, String email);
    FitnessServiceResponse update(Long id, UpdateFitnessServiceRequest request);
    FitnessServiceResponse getById(Long id);
    List<FitnessServiceResponse> getAll();
    List<FitnessServiceResponse> getActive();
    void delete(Long id);
}
