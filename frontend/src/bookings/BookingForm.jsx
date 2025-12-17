import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/jwt";

const BookingForm = () => {
  const { id } = useParams(); const nav = useNavigate();
  const [bus, setBus] = useState(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  // Missing State for Segments
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  const [seats, setSeats] = useState(1);
  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "Male" }]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/api/vehicles/${id}`).then(data => {
      setBus(data);
      setPickup(data.fromLocation);
      setDropoff(data.toLocation);
      setFromCity(data.fromLocation);
      setToCity(data.toLocation);
    }).catch(() => nav("/user-rides"));
  }, [id, nav]);

  // Derived State for Route & Price
  const stops = React.useMemo(() => {
    if (!bus) return [];
    return bus.route ? bus.route.split(" -> ") : [bus.fromLocation, bus.toLocation];
  }, [bus]);

  const segmentPrice = React.useMemo(() => {
    if (!bus) return 0;
    if (!bus.route) return bus.price;
    const startIdx = stops.findIndex(s => s.toLowerCase().includes(fromCity.toLowerCase()));
    const endIdx = stops.findIndex(s => s.toLowerCase().includes(toCity.toLowerCase()));

    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return bus.price;

    const totalHops = stops.length - 1;
    const userHops = endIdx - startIdx;
    const fraction = userHops / totalHops;
    const calc = bus.price * fraction;
    return Math.max(calc, bus.price * 0.2).toFixed(2); // Min 20% fare
  }, [bus, fromCity, toCity, stops]);

  useEffect(() => {
    const n = Number(seats) || 1;
    setPassengers(prev => {
      const arr = [...prev];
      while (arr.length < n) arr.push({ name: "", age: "", gender: "Male" });
      arr.length = n;
      return arr;
    });
  }, [seats]);

  const changePassenger = (i, field, val) => {
    setPassengers(prev => {
      const a = [...prev];
      a[i] = { ...a[i], [field]: val };
      return a;
    });
  };



  const submit = async (e) => {
    e.preventDefault();
    try {
      // Determine final locations based on segment selection or default inputs
      // If stops exist, we use the select-based fromCity/toCity. 
      // If not, we fall back to pickup/dropoff inputs (which should simulate the same flow).
      // Actually, let's just use fromCity/toCity as the source of truth if we sync them. 
      // But currently pickup/dropoff are separate. Checking the render conditions...
      // Render uses fromCity/toCity for "stops>2".
      const finalPickup = stops.length > 2 ? fromCity : pickup;
      const finalDropoff = stops.length > 2 ? toCity : dropoff;

      const priceToSubmit = Number((segmentPrice * seats).toFixed(2));

      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: bus.id,
          seats,
          pickupLocation: finalPickup,
          dropoffLocation: finalDropoff,
          totalPrice: priceToSubmit,
          passengers: passengers.map(p => ({ ...p, age: Number(p.age) }))
        })
      });
      alert("Booking Successful!"); // Feedback
      nav("/my-bookings");
    } catch (err) { setError(err.message || "Error"); }
  };

  if (!bus) return <div className="container mt-4"><div className="card text-center"><h2>Loading...</h2></div></div>;
  if (error) return <div className="container mt-4"><div className="card text-center text-danger"><h2>Error: {error}</h2></div></div>;
  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="text-center mb-4">Book Ride</h2>
        <div className="mb-4 p-4" style={{ background: 'var(--color-secondary)', borderRadius: 'var(--radius-md)' }}>
          <p><strong>Ride:</strong> {bus.fromLocation} → {bus.toLocation}</p>
          <p><strong>Date:</strong> {bus.date}</p>
        </div>

        <div className="card mb-4 p-3 bg-light">
          <h4 className="mb-3">Trip Details</h4>
          {/* Segment Selection */}
          {stops.length > 2 ? (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="form-group">
                <label className="label">Boarding Location</label>
                <select
                  className="select"
                  value={fromCity}
                  onChange={e => setFromCity(e.target.value)}
                >
                  {stops.slice(0, stops.length - 1).map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Dropping Location</label>
                <select
                  className="select"
                  value={toCity}
                  onChange={e => setToCity(e.target.value)}
                >
                  {stops.map((s, i) => (
                    <option key={i} value={s} disabled={i <= stops.findIndex(st => st === fromCity)}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="label">Pickup Location</label>
                <input className="input" value={pickup} onChange={e => setPickup(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Dropoff Location</label>
                <input className="input" value={dropoff} onChange={e => setDropoff(e.target.value)} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="label">Number of Seats</label>
            <input className="input" type="number" min="1" max={bus.tickets} value={seats} onChange={e => setSeats(e.target.value)} required />
          </div>

          <div className="alert alert-info mt-3">
            {stops.length > 2 && <p><strong>Selected Route: </strong> {fromCity} → {toCity}</p>}
            <p><strong>Price per Seat:</strong> ₹{segmentPrice}</p>
            <p className="font-bold text-large mt-1">Total Pay: ₹{(segmentPrice * seats).toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={submit}>
          {passengers.map((p, i) => (
            <div className="card mb-3 p-3" key={i} style={{ border: "1px solid #eee" }}>
              <h5 className="mb-2">Passenger {i + 1}</h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-group mb-0">
                  <label className="label">Name</label>
                  <input className="input" placeholder="Name" value={p.name} onChange={e => changePassenger(i, "name", e.target.value)} required />
                </div>
                <div className="form-group mb-0">
                  <label className="label">Age</label>
                  <input className="input" type="number" placeholder="Age" min="1" max="120" value={p.age} onChange={e => changePassenger(i, "age", e.target.value)} required />
                </div>
              </div>
              <div className="form-group mt-2 mb-0">
                <label className="label">Gender</label>
                <select className="select" value={p.gender} onChange={e => changePassenger(i, "gender", e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirm Booking</button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
