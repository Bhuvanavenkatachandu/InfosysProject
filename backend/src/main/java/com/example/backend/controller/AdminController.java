package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class AdminController {
    private final UserService userService;
    private final com.example.backend.service.BookingService bookingService;
    private final com.example.backend.service.VehicleService vehicleService;

    public AdminController(UserService userService,
            com.example.backend.service.BookingService bookingService,
            com.example.backend.service.VehicleService vehicleService) {
        this.userService = userService;
        this.bookingService = bookingService;
        this.vehicleService = vehicleService;
    }

    private boolean isSuperAdmin(Authentication auth) {
        if (auth == null)
            return false;
        // auth.getName() is email
        Optional<User> u = userService.findByEmail(auth.getName());
        return u.map(User::isSuperAdmin).orElse(false);
    }

    @GetMapping
    public ResponseEntity<?> all(Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        return ResponseEntity.ok(userService.allUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> edit(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }
        Optional<User> opt = userService.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        User u = opt.get();
        u.setName(body.getOrDefault("name", u.getName()));
        u.setEmail(body.getOrDefault("email", u.getEmail()));
        if (body.containsKey("role")) {
            String r = body.get("role");
            // Allow changing to 'user' or 'driver' or 'admin' (if authorized?)
            // For now let's just allow it blindly if they are admin.
            u.setRole(r);
        }
        userService.save(u);
        return ResponseEntity.ok(u);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        if (!isSuperAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "Only super admin can delete admins"));
        Optional<User> opt = userService.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        User u = opt.get();
        if (u.isSuperAdmin())
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot remove super admin"));
        userService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, Authentication auth) {
        if (!isSuperAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "Only super admin can approve"));
        Optional<User> opt = userService.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        User u = opt.get();
        if (!"pending-admin".equals(u.getRole()))
            return ResponseEntity.badRequest().body(Map.of("error", "Not pending"));
        u.setRole("admin");
        u.setRequestedAdmin(false);
        userService.save(u);
        return ResponseEntity.ok(Map.of("message", "Approved"));
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<?> revoke(@PathVariable Long id, Authentication auth) {
        if (!isSuperAdmin(auth))
            return ResponseEntity.status(403).body(Map.of("error", "Only super admin can revoke"));
        Optional<User> opt = userService.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "Not found"));
        User u = opt.get();
        if (u.isSuperAdmin())
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot revoke super admin"));
        u.setRole("user");
        u.setRequestedAdmin(false);
        userService.save(u);
        return ResponseEntity.ok(Map.of("message", "Revoked"));
    }

    @GetMapping("/stats/detailed")
    public ResponseEntity<?> getDetailedStats(Authentication auth) {
        // Allow any admin to view stats
        if (auth == null || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin required"));
        }

        List<User> users = userService.allUsers();
        long userCount = users.stream().filter(u -> "user".equals(u.getRole())).count();
        long driverCount = users.stream().filter(u -> "driver".equals(u.getRole())).count();

        List<com.example.backend.model.Booking> bookings = bookingService.allBookings();
        long totalBookings = bookings.size();
        long cancelledBookings = bookings.stream()
                .filter(b -> "CANCELLED".equals(b.getStatus()) || "REJECTED".equals(b.getStatus())).count();

        // Calculate earnings (assuming 10% commission or just total volume)
        // Let's just calculate Total Transaction Volume
        double totalVolume = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .mapToDouble(b -> b.getSeats() * b.getVehicle().getPrice())
                .sum();

        List<com.example.backend.model.Vehicle> rides = vehicleService.getAllVehicles();
        long totalRides = rides.size();

        return ResponseEntity.ok(Map.of(
                "userCount", userCount,
                "driverCount", driverCount,
                "totalBookings", totalBookings,
                "cancelledBookings", cancelledBookings,
                "totalVolume", totalVolume,
                "totalRides", totalRides));
    }
}
