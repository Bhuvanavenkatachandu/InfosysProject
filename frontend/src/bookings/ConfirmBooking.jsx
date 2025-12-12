import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = verifyJWT(token);

  const bookingData = location.state?.bookingData || null;

  useEffect(() => {
    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }
    if (!bookingData) {
      navigate("/user-rides");
      return;
    }
  }, [bookingData, navigate, user]);

  if (!bookingData || !bookingData.bus) {
    return (
      <div className="container">
        <h2>No booking data found.</h2>
      </div>
    );
  }

  const { bus, seats, passengerNames, busIndex } = bookingData;
  const total = Number(bus.price) * Number(seats || 0);

  const confirmBooking = async () => {
    try {
      const body = {
        vehicleId: bus.id,
        seats: Number(seats),
        passengerNames
      };
      await import("../utils/jwt").then(m => m.apiFetch("/api/bookings", { method: "POST", body: JSON.stringify(body) }));
      navigate("/booking-success");
    } catch (err) {
      alert(err.message || "Booking failed");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Pre-Booking Summary</h2>
        <p className="text-muted mb-4">Please review your ride details before confirming.</p>

        <h3>Ride Details</h3>
        <div className="mb-4 flex gap-4">
          {bus.imageUrl && <img src={bus.imageUrl} alt="Ride" style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />}
          <div>
            <p>
              <strong>From:</strong> {bus.fromLocation} <br />
              <strong>To:</strong> {bus.toLocation} <br />
              {bus.route && <><strong>Via:</strong> {bus.route}<br /></>}
              <strong>Date:</strong> {bus.date} <br />
              <strong>Vehicle:</strong> {bus.vehicleType} <br />
              {bus.driverName && <><strong>Driver:</strong> {bus.driverName}<br /></>}
              <strong>Price per seat:</strong> ₹{bus.price}
            </p>
          </div>
        </div>

        <h3>Passengers</h3>
        <p><strong>Seats:</strong> {seats}</p>
        <ul className="mb-4">
          {passengerNames.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>

        <h3>Total Amount: ₹{total}</h3>

        <div className="alert alert-warning mb-4" style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '4px' }}>
          <strong>Note:</strong> Your booking will be <strong>PENDING</strong> until approved by the driver.
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
          >
            Edit Details
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={confirmBooking}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;
