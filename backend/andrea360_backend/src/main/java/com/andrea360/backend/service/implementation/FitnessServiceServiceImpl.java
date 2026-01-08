package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.fitness_service.CreateFitnessServiceRequest;
import com.andrea360.backend.dto.fitness_service.FitnessServiceResponse;
import com.andrea360.backend.dto.fitness_service.UpdateFitnessServiceRequest;
import com.andrea360.backend.entity.Employee;
import com.andrea360.backend.entity.FitnessService;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.EmployeeRepository;
import com.andrea360.backend.repository.FitnessServiceRepository;
import com.andrea360.backend.service.FitnessServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FitnessServiceServiceImpl implements FitnessServiceService {

    private final FitnessServiceRepository fitnessServiceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public FitnessServiceResponse create(CreateFitnessServiceRequest request,String employeeEmail) {
        if (fitnessServiceRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("Fitness service with same name already exists.");
        }

        Employee e = employeeRepository.findByEmailIgnoreCase(employeeEmail)
                .orElseThrow(() -> new NotFoundException("Employee not found for email: " + employeeEmail));

        if (e.getLocation() == null) {
            throw new BusinessException("Employee has no location assigned.");
        }


        FitnessService service = new FitnessService();
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setPrice(request.getPrice());
        service.setActive(request.getActive() == null ? true : request.getActive());
        service.setLocation(e.getLocation());
        FitnessService saved = fitnessServiceRepository.save(service);
        return mapToResponse(saved);
    }

    @Override
    public FitnessServiceResponse update(Long id, UpdateFitnessServiceRequest request) {
        FitnessService existing = fitnessServiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Fitness service not found: " + id));

        if (fitnessServiceRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new BusinessException("Fitness service with same name already exists.");
        }

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setDurationMinutes(request.getDurationMinutes());
        existing.setPrice(request.getPrice());
        existing.setActive(request.getActive());

        FitnessService saved = fitnessServiceRepository.save(existing);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FitnessServiceResponse getById(Long id) {
        FitnessService service = fitnessServiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Fitness service not found: " + id));

        return mapToResponse(service);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FitnessServiceResponse> getAll() {
        return fitnessServiceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!fitnessServiceRepository.existsById(id)) {
            throw new NotFoundException("Fitness service not found: " + id);
        }
        fitnessServiceRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FitnessServiceResponse> getActive() {
        return fitnessServiceRepository.findAllActiveWithLocation()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private FitnessServiceResponse mapToResponse(FitnessService service) {
        return new FitnessServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getPrice(),
                service.isActive(),
                service.getLocation().getId(),
                service.getLocation().getName()
        );
    }
}