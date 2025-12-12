import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/jwt";

const BookingForm = () => {
  const { id } = useParams(); const nav = useNavigate();
  const [bus, setBus] = useState(null); const [seats, setSeats] = useState(1); const [names, setNames] = useState([""]);
  useEffect(() => { apiFetch(`/api/vehicles/${id}`).then(setBus).catch(() => nav("/user-rides")); }, [id, nav]);
  useEffect(() => { const n = Number(seats) || 1; setNames(prev => { const arr = [...prev]; while (arr.length < n) arr.push(""); arr.length = n; return arr; }); }, [seats]);

  const changeName = (i, val) => setNames(prev => { const a = [...prev]; a[i] = val; return a; });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/bookings", { method: "POST", body: JSON.stringify({ vehicleId: bus.id, seats, passengerNames: names }) });
      nav("/my-bookings");
    } catch (err) { alert(err.message || "Error"); }
  };

  if (!bus) return <div className="container mt-4"><div className="card text-center"><h2>Loading...</h2></div></div>;
  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="text-center mb-4">Book Ride</h2>
        <div className="mb-4 p-4" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius-md)' }}>
          <p><strong>From:</strong> {bus.fromLocation}</p>
          <p><strong>To:</strong> {bus.toLocation}</p>
          <p><strong>Date:</strong> {bus.date}</p>
          <p><strong>Seats left:</strong> {bus.tickets}</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Number of Seats</label>
            <input className="input" type="number" min="1" max={bus.tickets} value={seats} onChange={e => setSeats(e.target.value)} required />
          </div>
          {names.map((n, i) => (
            <div className="form-group" key={i}>
              <label className="label">Passenger {i + 1} Name</label>
              <input className="input" placeholder={`Passenger ${i + 1}`} value={n} onChange={e => changeName(i, e.target.value)} required />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirm Booking</button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
