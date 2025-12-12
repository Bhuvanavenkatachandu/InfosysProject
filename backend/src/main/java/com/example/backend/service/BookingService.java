package com.example.backend.service;

import com.example.backend.model.Booking;
import com.example.backend.model.Vehicle;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    public BookingService(BookingRepository bookingRepository, VehicleRepository vehicleRepository) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public Booking createBooking(Booking b) {
        Long vid = b.getVehicle().getId();
        Vehicle v = vehicleRepository.findById(vid).orElseThrow(() -> new RuntimeException("Vehicle not found"));
        if (b.getSeats() > v.getTickets()) throw new RuntimeException("Not enough seats available");
        v.setTickets(v.getTickets() - b.getSeats());
        vehicleRepository.save(v);
        b.setVehicle(v);
        return bookingRepository.save(b);
    }

    public List<Booking> findByUserEmail(String email) { return bookingRepository.findByUserEmail(email); }
    public List<Booking> allBookings() { return bookingRepository.findAll(); }
}
