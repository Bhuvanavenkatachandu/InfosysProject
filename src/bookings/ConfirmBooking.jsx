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

  const handleConfirm = () => {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const newBooking = {
      userEmail: user.email,
      busIndex,
      seats,
      passengerNames,
      bus,
    };
    bookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    const buses = JSON.parse(localStorage.getItem("buses")) || [];
    if (buses[busIndex]) {
      const remaining = (buses[busIndex].tickets || 0) - seats;
      buses[busIndex].tickets = remaining > 0 ? remaining : 0;
      localStorage.setItem("buses", JSON.stringify(buses));
    }

    navigate("/booking-success", { state: { booking: newBooking } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <h2>Pre-Booking Summary</h2>
      <p>Please review your ride details before confirming.</p>

      <h3>Ride Details</h3>
      <p>
        <strong>From:</strong> {bus.from} <br />
        <strong>To:</strong> {bus.to} <br />
        <strong>Date:</strong> {bus.date} <br />
        <strong>Vehicle:</strong> {bus.vehicleType} <br />
        <strong>Price per seat:</strong> {bus.price}
      </p>

      <h3>Passengers</h3>
      <p><strong>Seats:</strong> {seats}</p>
      <ul>
        {passengerNames.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>

      <h3>Total Amount</h3>
      <p>{isNaN(total) ? "-" : total}</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <button
          type="button"
          onClick={handleBack}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "none" }}
        >
          Edit Details
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default ConfirmBooking;
