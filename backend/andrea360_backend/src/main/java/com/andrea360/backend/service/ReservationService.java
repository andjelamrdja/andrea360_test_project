package com.andrea360.backend.service;

import com.andrea360.backend.dto.reservation.CreateReservationRequest;
import com.andrea360.backend.dto.reservation.ReservationResponse;
import com.andrea360.backend.dto.reservation.UpdateReservationRequest;

import java.util.List;

public interface ReservationService {

    ReservationResponse create(CreateReservationRequest request);

    ReservationResponse update(Long id, UpdateReservationRequest request);

    ReservationResponse getById(Long id);

    List<ReservationResponse> getAll();

    ReservationResponse confirm(Long id);

    ReservationResponse cancel(Long id);

    void delete(Long id);
}