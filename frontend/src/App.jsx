import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Common */
import Header from "./common/Header";
import ProtectedRoute from "./common/ProtectedRoute";

/* Auth */
import Login from "./auth/Login";
import Register from "./auth/Register";

/* Admin */
import Dashboard from "./admin/Dashboard";
import AdminUsers from "./admin/AdminUsers";
import AddVehicle from "./admin/AddVehicle";
import VehiclesList from "./admin/VehiclesList";
import DriverDashboard from "./driver/DriverDashboard";

/* User */
import UserBus from "./user/UserBus";

/* Bookings */
import BookingForm from "./bookings/BookingForm";
import ConfirmBooking from "./bookings/ConfirmBooking";
import UserBookings from "./bookings/UserBookings";
import PaymentSuccess from "./bookings/PaymentSuccess";

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/add-vehicle" element={<ProtectedRoute allowedRoles={["admin"]}><AddVehicle /></ProtectedRoute>} />
        <Route path="/admin/edit-vehicle/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AddVehicle /></ProtectedRoute>} />
        <Route path="/admin/vehicles" element={<ProtectedRoute allowedRoles={["admin"]}><VehiclesList /></ProtectedRoute>} />

        {/* Driver */}
        <Route path="/driver-dashboard" element={<ProtectedRoute allowedRoles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/driver/add-ride" element={<ProtectedRoute allowedRoles={["driver"]}><AddVehicle /></ProtectedRoute>} />

        {/* User */}
        <Route path="/user-rides" element={<ProtectedRoute allowedRoles={["user"]}><UserBus /></ProtectedRoute>} />
        <Route path="/book/:id" element={<ProtectedRoute allowedRoles={["user"]}><BookingForm /></ProtectedRoute>} />
        <Route path="/confirm-booking" element={<ProtectedRoute allowedRoles={["user"]}><ConfirmBooking /></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute allowedRoles={["user"]}><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={["user"]}><UserBookings /></ProtectedRoute>} />

        {/* fallback -> login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
