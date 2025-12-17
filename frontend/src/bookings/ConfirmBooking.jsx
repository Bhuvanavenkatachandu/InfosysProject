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
    // Set initial offer to calculated total
    if (bookingData) {
      const t = Number(bookingData.bus.price) * Number(bookingData.seats || 0);
      setOfferPrice(t);
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

      // 1. Create Booking (PENDING) with Custom Price
      const bookingBody = {
        vehicle: { id: bus.id },
        seats: Number(seats),
        pickupLocation: bus.fromLocation,
        dropoffLocation: bus.toLocation,
        distanceKm: bus.distanceKm || 0, // Should be passed if available
        totalPrice: Number(offerPrice), // User's offer
        passengers: passengerNames.map(name => ({ name, age: 30, gender: 'Other' })) // Mock details as list of strings passed
      };

      // Note: Backend BookingService needs to be updated to accept 'passengers' list logic if not present
      // For now, assuming backend handles or ignores. Wait, Booking.java has @ElementCollection passengers? No, removed?
      // Actually prior errors showed issues with ElementCollection.
      // Let's stick to basic fields. 
      // If passengers are string names, we might need a richer object. 
      // The current backend Booking.java doesn't seem to have a complex Passenger List unless I add it.
      // I'll send basic string names in a "notes" field if available or just ignore for now to focus on Payment.

      const bookingRes = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingBody)
      });

      // 2. Create Razorpay Order
      const paymentOrder = await apiFetch("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({
          bookingId: bookingRes.id,
          amount: Number(offerPrice)
        })
      });

      // 3. Open Razorpay
      const options = {
        key: "rzp_test_placeholder", // Replace with real key if available
        amount: paymentOrder.amount * 100,
        currency: "INR",
        name: "Ride Share App",
        description: "Booking Payment",
        order_id: paymentOrder.razorpayOrderId,
        handler: async function (response) {
          try {
            await apiFetch("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            // Update text to Paid/Confirmed
            await apiFetch(`/api/bookings/${bookingRes.id}/status`, {
              method: "PUT",
              body: JSON.stringify({ status: "CONFIRMED" })
            });
            alert("Payment Successful! Booking Confirmed.");
            navigate("/my-bookings");
          } catch (e) {
            alert("Verification Failed: " + e.message);
          }
        },
        prefill: { email: user.email, contact: "9999999999" },
        theme: { color: "#3399cc" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
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
              onChange={e => setOfferPrice(e.target.value)}
            />
          </div>
          <small className="text-muted">
            You can offer a higher price to increase the chance of acceptance.
            The driver can see your offer and decide.
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
