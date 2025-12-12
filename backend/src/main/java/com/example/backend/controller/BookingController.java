package com.example.backend.controller;

import com.example.backend.model.Booking;
import com.example.backend.model.Vehicle;
import com.example.backend.service.BookingService;
import com.example.backend.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    private final VehicleService vehicleService;

    public BookingController(BookingService bookingService, VehicleService vehicleService) {
        this.bookingService = bookingService;
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Authentication auth) {
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_USER"))) {
            return ResponseEntity.status(403).body(Map.of("error","User required"));
        }
        try {
            Long vehicleId = Long.valueOf(body.get("vehicleId").toString());
            int seats = Integer.parseInt(body.get("seats").toString());
            List<String> passengers = (List<String>) body.get("passengerNames");
            Vehicle v = vehicleService.findById(vehicleId).orElseThrow(() -> new RuntimeException("Vehicle not found"));

            Booking b = new Booking();
            b.setUserEmail(auth.getName());
            b.setVehicle(v);
            b.setSeats(seats);
            b.setPassengerNames(passengers);

            Booking saved = bookingService.createBooking(b);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> myBookings(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        List<Booking> list = bookingService.findByUserEmail(auth.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping
    public ResponseEntity<?> allBookings(Authentication auth) {
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error","Admin required"));
        }
        return ResponseEntity.ok(bookingService.allBookings());
    }
    @GetMapping("/driver")
    public ResponseEntity<?> driverBookings(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        // This requires a new service method to find bookings where vehicle.driverEmail = auth.getName()
        // OR we filter all bookings. For efficiency, let's assume we can filter or we just list all and filter in memory (not ideal but works for now)
        // ideally: bookingService.findByDriverEmail(auth.getName())
        
        // Let's rely on the service to implement this or a custom query.
        // Since we cannot easily modify Repository/Service blindly, let's use a workaround:
        // Get all bookings and filter by stream (OK for small scale).
        List<Booking> all = bookingService.allBookings(); 
        List<Booking> driverBookings = all.stream()
            .filter(b -> b.getVehicle() != null && auth.getName().equals(b.getVehicle().getDriverEmail()))
            .toList();
            
        return ResponseEntity.ok(driverBookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        String newStatus = body.get("status");
        
        Booking b = bookingService.allBookings().stream().filter(x -> x.getId().equals(id)).findFirst().orElse(null);
        if (b == null) return ResponseEntity.status(404).body(Map.of("error","Booking not found"));
        
        // Verify this booking belongs to a vehicle owned by this driver
        if (!auth.getName().equals(b.getVehicle().getDriverEmail())) {
             return ResponseEntity.status(403).body(Map.of("error","Not your booking"));
        }
        
        b.setStatus(newStatus);
        bookingService.createBooking(b); // Save
        return ResponseEntity.ok(b);
    }
}
