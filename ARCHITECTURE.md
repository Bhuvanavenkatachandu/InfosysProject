# System Architecture

## Overview
This document describes the architecture of the Ride Share application, a full-stack platform for ride sharing, vehicle management, and secure payments.

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Spring Boot (Java 17)
- **Database**: H2 (File-based: `rideshare_v2.mv.db`)
- **Authentication**: JWT (JSON Web Token) with Spring Security
- **Real-time**: WebSocket (SockJS/STOMP)
- **Payments**: Stripe (Stripe Java SDK + React Stripe Elements)

---

## 1. Backend Architecture
The backend is a Spring Boot application running on **Port 8084**.

### Security & CORS
- **Spring Security**: Enforces JWT authentication for all protected routes (e.g., `/api/payments/**`, `/api/bookings/**`).
- **Public Routes**: `/api/auth/**`, `/h2-console/**`, and `/ws/**` are permitted for initialization/handshake.
- **CORS Whitelist**: Explicitly allows dev ports `5173`, `5174`, and `5175` to prevent browser preflight blockage.

### Data Model (Persistence)
- **Database**: Standardized to a single file-based H2 database `rideshare_v2` for persistence across sessions.
- **Entities**:
  - `User`: Handles roles (ADMIN, DRIVER, USER).
  - `Vehicle`: Stores ride details and driver info.
  - `Booking`: Tracks seat reservations and payment status (`PENDING` -> `CONFIRMED`).
  - `Payment`: Logs Stripe `PaymentIntentId` and transaction status.

### APIs
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- **Bookings**: Handled via `BookingController`, starts as `PENDING`.
- **Payments**: `create-payment-intent` logic located in `PaymentController`.

---

## 2. Frontend Architecture
The frontend is a Vite-powered React application running on **Port 5173/5174/5175**.

### API Communication
- **apiFetch**: A centralized utility in `frontend/src/utils/jwt.js` that:
  - Automatically appends the `Authorization: Bearer <token>` header.
  - Switches between `localhost` and `127.0.0.1` based on the browser origin.
  - Handles token expiration and server-side verification.

### Navigation & Redirection
- **Redirection Logic**: Validates JWT with the server on login to prevent "stale session" loops.
- **Protected Routes**: Implemented via a `ProtectedRoute` component that checks roles before rendering pages.

### Payment Flow
1. **Selection**: User selects/negotiates a ride on `BookingForm`.
2. **Confirmation**: `ConfirmBooking` creates a `PENDING` record in the DB.
3. **Stripe Layer**: `PaymentPage` initializes Stripe Elements and fetches a `clientSecret`.
4. **Success**: Upon success, the backend updates the booking to `CONFIRMED` and registers the `paymentIntentId`.

---

## 3. Real-time Notifications
- **WebSocket**: Uses `/ws` endpoint on port **8084**.
- **Handshake**: Whitelisted in `SecurityConfig` to allow SockJS connections without initial JWT headers (authentication is handles in the STOMP message channel).

---

## 4. Stripe Payment PoC (Standalone)
A separate Proof-of-Concept is available in the `/StripePaymentPoC` directory.
- **Backend (Port 8081)**: Minimalist Spring Boot app for intent creation.
- **Frontend**: Demonstrates raw Stripe Elements integration with dynamic `return_url` handling.
- **Status**: Updated to be fully compatible with the whitelisted dev ports.
