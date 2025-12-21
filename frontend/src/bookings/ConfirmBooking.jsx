import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyJWT, apiFetch } from "../utils/jwt";

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = verifyJWT(token);

  const bookingData = location.state?.bookingData || null;

  const [offerPrice, setOfferPrice] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }
    if (!bookingData) {
      navigate("/user-rides");
      return;
    }
    // Set initial offer to calculated total (prefer passed segment total)
    if (bookingData) {
      const initialPrice = bookingData.totalPrice || (Number(bookingData.bus.price || 0) * Number(bookingData.seats || 0));
      setOfferPrice(initialPrice);
    }
  }, [bookingData, navigate, user]);

  if (!bookingData || !bookingData.bus) {
    return <div className="container"><h2>No booking data found.</h2></div>;
  }

  const { bus, seats, passengerNames } = bookingData;
  // Calculate Standard Price
  const standardTotal = Number(bus.price) * Number(seats || 0);

  const handlePayment = async () => {
    try {
      if (offerPrice <= 0) { alert("Price must be greater than 0"); return; }

      // 1. Create Booking (PENDING)
      const bookingBody = {
        vehicleId: bus.id,
        seats: Number(seats),
        pickupLocation: bookingData.pickup || bus.fromLocation,
        dropoffLocation: bookingData.dropoff || bus.toLocation,
        totalPrice: Number(offerPrice),
        passengers: passengerNames.map(name => ({ name, age: 30, gender: 'Other' }))
      };

      console.log("Creating booking with body:", bookingBody);
      const bookingRes = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingBody)
      });

      console.log("Booking created successfully. Response:", bookingRes);
      // 2. Redirect to Stripe Payment Page
      console.log("Navigating to /payment with amount:", offerPrice, "bookingId:", bookingRes.id);
      navigate("/payment", { state: { amount: Number(offerPrice), bookingId: bookingRes.id } });

    } catch (err) {
      console.error("ConfirmBooking: handlePayment failed:", err);
      alert("Process Failed: " + err.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Confirm & Pay</h2>

        <div className="mb-4">
          <h4 className="text-muted">Ride Summary</h4>
          <p><strong>{bus.fromLocation}</strong> &rarr; <strong>{bus.toLocation}</strong></p>
          <p>Date: {bus.date}</p>
          <p>Vehicle: {bus.vehicleType}</p>
          <p>Seats: {seats}</p>
          <p>Passengers: {passengerNames.join(", ")}</p>
        </div>

        <div className="mb-4 p-3 bg-light rounded">
          <div className="flex justify-between items-center mb-2">
            <span>Calculated Fare:</span>
            <span className="text-muted" style={{ textDecoration: 'line-through' }}>₹{standardTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <label><strong>Your Offer (₹):</strong></label>
            <input
              type="number"
              className="input"
              style={{ width: '120px', textAlign: 'right', fontWeight: 'bold' }}
              value={offerPrice}
              min="1"
              max={standardTotal * 2} // Optional soft cap to prevent "astronomical" glitch
              onChange={e => setOfferPrice(Number(e.target.value))}
            />
          </div>
          <small className="text-muted">
            You can offer a price to negotiate with the driver.
            Default is the {bookingData.totalPrice ? "calculated segment price" : "standard price"}.
          </small>
        </div>

        <div className="flex justify-between">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
          <button className="btn btn-primary" onClick={handlePayment}>Pay & Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;
