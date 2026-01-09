package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.location.CreateLocationRequest;
import com.andrea360.backend.dto.location.LocationResponse;
import com.andrea360.backend.dto.location.UpdateLocationRequest;
import com.andrea360.backend.entity.Location;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.LocationRepository;
import com.andrea360.backend.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;

    @Override
    public LocationResponse create(CreateLocationRequest request) {
        if (locationRepository.existsByNameAndAddress(request.getName(), request.getAddress())) {
            throw new BusinessException("Location with same name and address already exists.");
        }

        Location location = new Location();
        location.setName(request.getName());
        location.setAddress(request.getAddress());

        Location saved = locationRepository.save(location);
        return mapToResponse(saved);
    }

    @Override
    public LocationResponse update(Long id, UpdateLocationRequest request) {
        Location existing = locationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Location not found: " + id));

        boolean duplicate = locationRepository.existsByNameAndAddress(request.getName(), request.getAddress());
        if (duplicate && !(existing.getName().equals(request.getName()) && existing.getAddress().equals(request.getAddress()))) {
            throw new BusinessException("Location with same name and address already exists.");
        }

        existing.setName(request.getName());
        existing.setAddress(request.getAddress());

        Location saved = locationRepository.save(existing);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Location not found: " + id));

        return mapToResponse(location);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getAll() {
        return locationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new NotFoundException("Location not found: " + id);
        }
        locationRepository.deleteById(id);
    }

    private LocationResponse mapToResponse(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getAddress()
        );
    }
}