package com.andrea360.backend.controller;

import com.andrea360.backend.dto.reservation.CreateReservationRequest;
import com.andrea360.backend.dto.reservation.ReservationResponse;
import com.andrea360.backend.dto.reservation.UpdateReservationRequest;
import com.andrea360.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest request) {
        return reservationService.create(request);
    }

    @PutMapping("/{id}")
    public ReservationResponse update(@PathVariable Long id,
                                      @Valid @RequestBody UpdateReservationRequest request) {
        return reservationService.update(id, request);
    }

    @GetMapping("/{id}")
    public ReservationResponse getById(@PathVariable Long id) {
        return reservationService.getById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
    @GetMapping
    public List<ReservationResponse> getAll() {
        return reservationService.getAll();
    }

//    @PatchMapping("/{id}/confirm")
//    public ReservationResponse confirm(@PathVariable Long id) {
//        return reservationService.confirm(id);
//    }

    @PatchMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Long id) {
        return reservationService.cancel(id);
    }

    @PreAuthorize("hasAnyRole('MEMBER','ADMIN','EMPLOYEE')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        reservationService.delete(id);
    }
}