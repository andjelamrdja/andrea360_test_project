package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.session.CreateSessionRequest;
import com.andrea360.backend.dto.session.SessionResponse;
import com.andrea360.backend.dto.session.UpdateSessionRequest;
import com.andrea360.backend.entity.Employee;
import com.andrea360.backend.entity.FitnessService;
import com.andrea360.backend.entity.Location;
import com.andrea360.backend.entity.Session;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.EmployeeRepository;
import com.andrea360.backend.repository.FitnessServiceRepository;
import com.andrea360.backend.repository.LocationRepository;
import com.andrea360.backend.repository.SessionRepository;
import com.andrea360.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final LocationRepository locationRepository;
    private final FitnessServiceRepository fitnessServiceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public SessionResponse create(CreateSessionRequest request) {
        validateTimeRange(request.getStartsAt(), request.getEndsAt());

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));

        FitnessService fitnessService = fitnessServiceRepository.findById(request.getFitnessServiceId())
                .orElseThrow(() -> new NotFoundException("FitnessService not found: " + request.getFitnessServiceId()));

        Employee trainer = employeeRepository.findById(request.getTrainerEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee (trainer) not found: " + request.getTrainerEmployeeId()));

        if (sessionRepository.existsTrainerOverlap(trainer.getId(), request.getStartsAt(), request.getEndsAt(), null)) {
            throw new BusinessException("Trainer already has a session in that time range.");
        }

        if (!fitnessService.getLocation().getId().equals(location.getId())) {
            throw new BusinessException("Service does not belong to selected location.");
        }

        if (!trainer.getLocation().getId().equals(location.getId())) {
            throw new BusinessException("Trainer does not belong to selected location.");
        }

        if (!fitnessService.getLocation().getId().equals(trainer.getLocation().getId())) {
            throw new BusinessException("You cannot create a session for a service outside your location.");
        }

        Session s = new Session();
        s.setStartsAt(request.getStartsAt());
        s.setEndsAt(request.getEndsAt());
        s.setCapacity(request.getCapacity());
        s.setStatus("SCHEDULED");
        s.setLocation(location);
        s.setFitnessService(fitnessService);
        s.setTrainer(trainer);

        Session saved = sessionRepository.save(s);
        return mapToResponse(saved);
    }

    @Override
    public SessionResponse update(Long id, UpdateSessionRequest request) {
        validateTimeRange(request.getStartsAt(), request.getEndsAt());

        Session existing = sessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Session not found: " + id));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));

        FitnessService fitnessService = fitnessServiceRepository.findById(request.getFitnessServiceId())
                .orElseThrow(() -> new NotFoundException("FitnessService not found: " + request.getFitnessServiceId()));

        Employee trainer = employeeRepository.findById(request.getTrainerEmployeeId())
                .orElseThrow(() -> new NotFoundException("Employee (trainer) not found: " + request.getTrainerEmployeeId()));

        if (sessionRepository.existsTrainerOverlap(trainer.getId(), request.getStartsAt(), request.getEndsAt(), id)) {
            throw new BusinessException("Trainer already has a session in that time range.");
        }

        existing.setStartsAt(request.getStartsAt());
        existing.setEndsAt(request.getEndsAt());
        existing.setCapacity(request.getCapacity());
        existing.setStatus(request.getStatus());
        existing.setLocation(location);
        existing.setFitnessService(fitnessService);
        existing.setTrainer(trainer);

        Session saved = sessionRepository.save(existing);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SessionResponse getById(Long id) {
        Session s = sessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Session not found: " + id));
        return mapToResponse(s);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponse> getAll() {
        return sessionRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new NotFoundException("Session not found: " + id);
        }
        sessionRepository.deleteById(id);
    }

    private void validateTimeRange(java.time.OffsetDateTime start, java.time.OffsetDateTime end) {
        if (start == null || end == null) return;
        if (!end.isAfter(start)) {
            throw new BusinessException("endsAt must be after startsAt.");
        }
    }

    private SessionResponse mapToResponse(Session s) {
        String trainerName = s.getTrainer().getFirstName() + " " + s.getTrainer().getLastName();

        return new SessionResponse(
                s.getId(),
                s.getStartsAt(),
                s.getEndsAt(),
                s.getCapacity(),
                s.getStatus(),
                s.getLocation().getId(),
                s.getLocation().getName(),
                s.getFitnessService().getId(),
                s.getFitnessService().getName(),
                s.getTrainer().getId(),
                trainerName
        );
    }
}