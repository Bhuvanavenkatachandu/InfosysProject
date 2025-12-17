# Rideshare Application - Project Guide

This guide explains the project structure and how the application works, making it easy to explain to others.

## 1. Project Overview
This is a full-stack **Rideshare Application** that allows:
*   **Users**: Search and book rides.
*   **Drivers**: Post rides and manage reservations.
*   **Admins**: Manage users and vehicles.

## 2. Technical Stack
*   **Frontend**: React (Vite)
*   **Backend**: Java (Spring Boot)
*   **Database**: H2 (In-memory for development) or MySQL

## 3. Project Structure
The project is split into two main folders:

```
InfosysProject/
├── backend/            # Spring Boot Application
│   └── src/main/java   # Backend Source Code
│       ├── controller  # API Endpoints (e.g., VehicleController)
│       ├── service     # Business Logic (e.g., VehicleService)
│       └── model       # Database Entities (Vehicle, User)
└── frontend/           # React Application
    └── src/
        ├── admin/      # Admin Views
        ├── driver/     # Driver Views
        ├── user/       # User Views
        └── components/ # Reusable UI Components
```

## 4. Key Logic Flows

### Posting a Ride (Driver)
1.  Driver fills the form on Frontend (`AddVehicle.jsx`).
2.  Frontend calls `POST /api/vehicles`.
3.  **VehicleController**: Receives request + Authentication (JWT).
4.  **VehicleService**:
    *   Finds the logged-in Driver (User).
    *   Attaches Driver Name/Email/Image to the new Vehicle.
    *   Auto-creates a booking if the driver reserved seats for themselves.
    *   Saves to Database.

### Booking a Ride (User)
1.  User views rides on `UserBus.jsx`.
2.  Clicks "Book" -> `BookingForm.jsx`.
3.  Submits booking -> Backend `BookingService` reduces vehicle tickets and saves booking.

## 5. Security
*   **JWT (JSON Web Tokens)**: Used for keeping users logged in.
*   **ProtectedRoute**: Frontend component that checks if you are allowed on a page (e.g., preventing Users from seeing Admin pages).

## 6. How to Run
1.  **Backend**: Open terminal in `backend/` and run `./gradlew bootRun`.
2.  **Frontend**: Open terminal in `frontend/` and run `npm run dev`.
