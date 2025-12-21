import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => { apiFetch("/api/bookings/me").then(setBookings).catch(() => setBookings([])); }, []);

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return "-";
    const rideDate = new Date(dateStr);
    const today = new Date();
    const diffTime = rideDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `${diffDays} days left` : "Completed";
  };

  const formatTime = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString();
  };

  return (
    <div className="container mt-4">

      <h2>My Bookings</h2>
      <div className="table-container">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Travel Date</th>
              <th>Booking Time</th>
              <th>Seats</th>
              <th>Status / Days Left</th>
            </tr>
          </thead>
          <tbody>{bookings.map(b => (
            <tr key={b.id}>
              <td>{b.vehicle.fromLocation}</td>
              <td>{b.vehicle.toLocation}</td>
              <td>{b.vehicle.date}</td>
              <td style={{ fontSize: '0.9em', color: '#666' }}>{formatTime(b.createdAt)}</td>
              <td>
                <p><strong>Seats:</strong> {b.seats}</p>
                <p><strong>Total:</strong> ₹{b.totalPrice || (b.seats * b.vehicle.price)}</p>
              </td>
              <td>
                <div style={{ marginBottom: '5px' }}>
                  <span className={`badge ${b.status === "CONFIRMED" ? "success" : b.status === "PENDING" ? "warning" : "error"}`}>
                    {b.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  {getDaysLeft(b.vehicle.date)}
                </div>
                {b.vehicle.driverPhone && (
                  <div style={{ marginTop: '5px', fontSize: '0.85em' }} className="text-primary">
                    <i className="fas fa-phone"></i> {b.vehicle.driverPhone}
                  </div>
                )}

              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div >
  );
};

// Import at top need to be added manually or automatically if supported. I will do full Replace.


export default UserBookings;
