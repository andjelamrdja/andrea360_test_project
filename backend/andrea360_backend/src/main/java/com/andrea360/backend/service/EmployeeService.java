package com.andrea360.backend.service;

import com.andrea360.backend.dto.employee.CreateEmployeeRequest;
import com.andrea360.backend.dto.employee.EmployeeResponse;
import com.andrea360.backend.dto.employee.UpdateEmployeeRequest;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse create(CreateEmployeeRequest request);

    EmployeeResponse update(Long id, UpdateEmployeeRequest request);

    EmployeeResponse getById(Long id);

    List<EmployeeResponse> getAll();

    void delete(Long id);
}