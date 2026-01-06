package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.employee.CreateEmployeeRequest;
import com.andrea360.backend.dto.employee.EmployeeResponse;
import com.andrea360.backend.dto.employee.UpdateEmployeeRequest;
import com.andrea360.backend.entity.Employee;
import com.andrea360.backend.entity.Location;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.EmployeeRepository;
import com.andrea360.backend.repository.LocationRepository;
import com.andrea360.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final LocationRepository locationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public EmployeeResponse create(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Employee with same email already exists.");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));

        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setRole(request.getAuthRole().name());
        employee.setLocation(location);
        employee.setAuthRole(request.getAuthRole());
        employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    @Override
    public EmployeeResponse update(Long id, UpdateEmployeeRequest request) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));

        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(request.getEmail(), id)) {
            throw new BusinessException("Employee with same email already exists.");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));

        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setRole(request.getRole());
        existing.setLocation(location);

        Employee saved = employeeRepository.save(existing);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));

        return mapToResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAll() {
        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new NotFoundException("Employee not found: " + id);
        }
        employeeRepository.deleteById(id);
    }

    private EmployeeResponse mapToResponse(Employee e) {
        // location is LAZY, but we're inside transactional service; safe for mapping
        return new EmployeeResponse(
                e.getId(),
                e.getFirstName(),
                e.getLastName(),
                e.getEmail(),
                e.getPhone(),
                e.getRole(),
                e.getLocation().getId(),
                e.getLocation().getName()
        );
    }
}
