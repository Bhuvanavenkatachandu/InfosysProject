import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/jwt";
import { useNavigate, useParams } from "react-router-dom";

const AddVehicle = () => {
  const { id } = useParams();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [tickets, setTickets] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [route, setRoute] = useState("");

  const nav = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      apiFetch(`/api/vehicles/${id}`).then(v => {
        setFrom(v.fromLocation);
        setTo(v.toLocation);
        setDate(v.date);
        setPrice(v.price);
        setTickets(v.tickets);
        setType(v.vehicleType);
        setImageUrl(v.imageUrl || "");
        setRoute(v.route || "");
      }).catch(err => {
        alert("Failed to load vehicle details");
        nav("/admin/vehicles");
      });
    }
  }, [id, isEdit, nav]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        fromLocation: from,
        toLocation: to,
        date,
        price: Number(price),
        tickets: Number(tickets),
        vehicleType: type,
        imageUrl,
        route
      };

      if (isEdit) {
        await apiFetch(`/api/vehicles/${id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/vehicles", { method: "POST", body: JSON.stringify(body) });
      }
      nav("/admin/vehicles");
    } catch (err) { alert(err.message || "Error"); }
  };

  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="mb-4 text-center">{isEdit ? "Edit Ride" : "Add New Ride"}</h2>
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">From Location</label>
              <input className="input" placeholder="e.g. New York" value={from} onChange={e => setFrom(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">To Location</label>
              <input className="input" placeholder="e.g. Boston" value={to} onChange={e => setTo(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Via Route (Major Points)</label>
            <input className="input" placeholder="e.g. Highway 44, Toll Plaza, City Center" value={route} onChange={e => setRoute(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">Date</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Vehicle Type</label>
              <input className="input" placeholder="e.g. Bus, Van, Sedan" value={type} onChange={e => setType(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">Price ($)</label>
              <input className="input" type="number" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Available Seats</label>
              <input className="input" type="number" placeholder="e.g. 40" value={tickets} onChange={e => setTickets(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Image URL (Optional)</label>
            <input className="input" placeholder="https://example.com/bus.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{isEdit ? "Update Ride" : "Add Ride"}</button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
