import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const BookingForm = () => {
  const { index } = useParams();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState(1);
  const [passengerNames, setPassengerNames] = useState([""]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);
    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }

    const allBuses = JSON.parse(localStorage.getItem("buses")) || [];
    const selected = allBuses[Number(index)];
    if (!selected) {
      navigate("/user-rides");
      return;
    }
    setBus(selected);
  }, [index, navigate]);

  useEffect(() => {
    const n = Number(seats) || 1;
    setPassengerNames((prev) => {
      const arr = [...prev];
      if (n > arr.length) {
        while (arr.length < n) arr.push("");
      } else {
        arr.length = n;
      }
      return arr;
    });
  }, [seats]);

  const handleNameChange = (i, value) => {
    setPassengerNames((prev) => {
      const arr = [...prev];
      arr[i] = value;
      return arr;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bus) return;

    if (Number(seats) > Number(bus.tickets)) {
      alert("Cannot book more seats than available.");
      return;
    }

    const bookingData = {
      busIndex: Number(index),
      bus,
      seats: Number(seats),
      passengerNames,
    };

    navigate("/confirm-booking", { state: { bookingData } });
  };

  if (!bus) {
    return (
      <div className="container">
        <h2>No ride details found.</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Ride Booking Details</h2>

      <p>
        <strong>From:</strong> {bus.from} &nbsp;
        <strong>To:</strong> {bus.to} &nbsp;
        <strong>Date:</strong> {bus.date} &nbsp;
        <strong>Vehicle:</strong> {bus.vehicleType} &nbsp;
        <strong>Available seats:</strong> {bus.tickets}
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="number"
          min="1"
          max={bus.tickets}
          placeholder="Number of seats"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          required
        />

        {passengerNames.map((name, i) => (
          <input
            key={i}
            placeholder={`Passenger ${i + 1} name`}
            value={name}
            onChange={(e) => handleNameChange(i, e.target.value)}
            required
          />
        ))}

        <button type="submit">Continue to Pre-Booking</button>
      </form>
    </div>
  );
};

export default BookingForm;
