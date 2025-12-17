package com.example.backend.service;

import com.example.backend.model.Vehicle;
import com.example.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {
    private final VehicleRepository repo;
    private final UserService userService;
    private final BookingService bookingService;
    private final GoogleMapsService googleMapsService;

    public VehicleService(VehicleRepository repo, UserService userService, BookingService bookingService,
            GoogleMapsService googleMapsService) {
        this.repo = repo;
        this.userService = userService;
        this.bookingService = bookingService;
        this.googleMapsService = googleMapsService;
    }

    public Vehicle create(Vehicle v) {
        return repo.save(v);
    }

    /**
     * Creation logic for a Driver posting a ride.
     * Handles setting driver info and creating auto-reservations.
     */
    public Vehicle createPost(Vehicle v, String userEmail) {
        // 1. Fetch User
        com.example.backend.model.User u = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        // 2. Set Driver Details
        v.setDriverEmail(u.getEmail());
        v.setDriverName(u.getName());
        v.setDriverImage(u.getProfileImage());
        // driverPhone is passed from frontend
        // Logic: Request Body phone >> User Profile phone (if available)
        // User model currently doesn't have phone, so we rely on input
        // v.getDriverPhone()
        if (v.getDriverPhone() == null || v.getDriverPhone().isEmpty()) {
            // Future: fallback to u.getPhone() if added to User model
        }

        // 2b. Calculate Dynamic Fare (if price is 0 or auto-calc requested)
        if (v.getPrice() <= 0 && v.getFromLocation() != null && v.getToLocation() != null) {
            long distanceMeters = googleMapsService.getDistanceInMeters(v.getFromLocation(), v.getToLocation());
            double distanceKm = distanceMeters / 1000.0;
            double baseFare = 50.0;
            double ratePerKm = 10.0;
            double totalFare = baseFare + (ratePerKm * distanceKm);

            // Per seat pricing logic
            // If calculating total cost for the trip, we might divide by seats.
            // Usually ride share price is "per seat".
            // Let's assume the calculated fare is for the whole trip, and we divide by
            // total capacity to get per-seat price?
            // OR the ratePerKm is already "per passenger km"?
            // Let's stick to the plan: (Base + Rate*Dist) / Seats
            int capacity = v.getTickets() > 0 ? v.getTickets() : 1; // avoid div/0
            double pricePerSeat = totalFare / capacity;

            // Round to 2 decimals
            pricePerSeat = Math.round(pricePerSeat * 100.0) / 100.0;

            v.setPrice(pricePerSeat);
        }

        // 3. Save Vehicle
        Vehicle saved = repo.save(v);

        // 4. Handle Reservation (if driver reserves seats for themselves/friends)
        if (v.getReservedSeats() > 0) {
            try {
                com.example.backend.model.Booking b = new com.example.backend.model.Booking();
                b.setUserEmail(u.getEmail());
                b.setVehicle(saved);
                b.setSeats(v.getReservedSeats());
                b.setStatus("PENDING");
                b.setPassengers(java.util.List.of(
                        new com.example.backend.model.Passenger("Driver Reserved", 0, "N/A")));
                bookingService.createBooking(b);
            } catch (Exception ex) {
                // Log but don't fail the whole creation?
                // For now print trace, ideally use SLF4J
                System.err.println("Failed to auto-reserve seats: " + ex.getMessage());
            }
        }
        return saved;
    }

    public List<Vehicle> list() {
        return repo.findAll();
    }

    public Optional<Vehicle> findById(Long id) {
        return repo.findById(id);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<Vehicle> searchVehicles(String from, String to) {
        return repo.searchVehicles(from, to);
    }

    public Vehicle save(Vehicle v) {
        return repo.save(v);
    }

    public List<Vehicle> getAllVehicles() {
        return list();
    }
}
