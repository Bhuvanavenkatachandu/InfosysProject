package com.example.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private int seats;

    @ElementCollection
    @CollectionTable(name = "booking_passengers", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "passenger_name")
    private List<String> passengerNames;

    private String status = "PENDING"; // PENDING, CONFIRMED, REJECTED

    private Instant createdAt = Instant.now();

    public Booking() {}

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public int getSeats() { return seats; }
    public void setSeats(int seats) { this.seats = seats; }
    public List<String> getPassengerNames() { return passengerNames; }
    public void setPassengerNames(List<String> passengerNames) { this.passengerNames = passengerNames; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
