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
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        try {
            Long vehicleId = Long.valueOf(body.get("vehicleId").toString());
            Vehicle v = vehicleService.findById(vehicleId).orElseThrow(() -> new RuntimeException("Vehicle not found"));

            boolean isDriver = auth.getName().equals(v.getDriverEmail());

            // Access Control: Allow ROLE_USER OR the Driver of this vehicle
            boolean isUser = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
            if (!isUser && !isDriver) {
                return ResponseEntity.status(403).body(Map.of("error", "User or Owner required"));
            }

            int seats = Integer.parseInt(body.get("seats").toString());
            System.out.println("Booking Payload Keys: " + body.keySet());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rawPassengers = (List<Map<String, Object>>) body.get("passengers");
            if (rawPassengers == null)
                rawPassengers = List.of(); // Defensive fix

            List<com.example.backend.model.Passenger> passengers = rawPassengers.stream().map(p -> {
                String name = (String) p.get("name");
                int age = Integer.parseInt(p.get("age").toString());
                String gender = (String) p.get("gender");
                return new com.example.backend.model.Passenger(name, age, gender);
            }).toList();

            Booking b = new Booking();
            b.setUserEmail(auth.getName());
            b.setVehicle(v);
            b.setSeats(seats);
            b.setPassengers(passengers);

            // Extract Locations from Body
            if (body.containsKey("pickupLocation"))
                b.setPickupLocation(body.get("pickupLocation").toString());
            if (body.containsKey("dropoffLocation"))
                b.setDropoffLocation(body.get("dropoffLocation").toString());

            if (body.containsKey("totalPrice")) {
                b.setTotalPrice(Double.valueOf(body.get("totalPrice").toString()));
            }

            // Direct Booking: Start as PENDING until payment
            b.setStatus("PENDING");

            Booking saved = bookingService.createBooking(b);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> myBookings(Authentication auth) {
        if (auth == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        List<Booking> list = bookingService.findByUserEmail(auth.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping
    public ResponseEntity<?> allBookings(Authentication auth) {
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        return ResponseEntity.ok(bookingService.allBookings());
    }

    @GetMapping("/driver")
    public ResponseEntity<?> driverBookings(Authentication auth) {
        if (auth == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        // This requires a new service method to find bookings where vehicle.driverEmail
        // = auth.getName()
        // OR we filter all bookings. For efficiency, let's assume we can filter or we
        // just list all and filter in memory (not ideal but works for now)
        // ideally: bookingService.findByDriverEmail(auth.getName())

        // Let's rely on the service to implement this or a custom query.
        // Since we cannot easily modify Repository/Service blindly, let's use a
        // workaround:
        // Get all bookings and filter by stream (OK for small scale).
        // Get all bookings and filter by stream (OK for small scale).
        // Get all bookings and filter by stream
        String currentUser = auth.getName();
        List<Booking> all = bookingService.allBookings();
        System.out.println("DEBUG: Sending request. Total bookings in DB: " + all.size());

        List<Booking> driverBookings = all.stream()
                .filter(b -> {
                    if (b.getVehicle() == null)
                        return false;
                    String vDriver = b.getVehicle().getDriverEmail();
                    if (vDriver == null) {
                        System.out.println("Booking " + b.getId() + " skipped: Vehicle has NO driver email");
                        return false;
                    }
                    boolean match = currentUser.trim().equalsIgnoreCase(vDriver.trim());
                    if (!match) {
                        System.out.println(
                                "Booking " + b.getId() + " mismatch: [" + vDriver + "] != [" + currentUser + "]");
                    }
                    return match;
                })
                .toList();

        System.out.println("Driver " + currentUser + " has " + driverBookings.size() + " bookings.");
        return ResponseEntity.ok(driverBookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
            Authentication auth) {
        if (auth == null)
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        String newStatus = body.get("status");

        Booking b = bookingService.findById(id).orElse(null);
        if (b == null)
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));

        // Verify this booking belongs to a vehicle owned by this driver
        if (!auth.getName().equals(b.getVehicle().getDriverEmail())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your booking"));
        }

        b.setStatus(newStatus);
        bookingService.updateBooking(b); // Save
        return ResponseEntity.ok(b);
    }

    @PostMapping("/estimate")
    public ResponseEntity<?> estimate(@RequestBody Booking b) {
        if (b.getPickupLocation() == null || b.getDropoffLocation() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "pickupLocation and dropoffLocation required"));
        }
        return ResponseEntity
                .ok(bookingService.estimatePrice(b.getPickupLocation(), b.getDropoffLocation(), b.getSeats()));
    }
}
