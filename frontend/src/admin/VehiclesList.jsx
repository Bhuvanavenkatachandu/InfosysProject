import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const VehiclesList = () => {
  const [list, setList] = useState([]);
  const nav = useNavigate();
  useEffect(() => { apiFetch("/api/vehicles").then(setList).catch(() => setList([])); }, []);
  const remove = async (id) => { if (!confirm("Delete?")) return; await apiFetch(`/api/vehicles/${id}`, { method: "DELETE" }); setList(list.filter(v => v.id !== id)); };
  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2>All Vehicles / Rides</h2>
        <button className="btn btn-primary btn-sm" onClick={() => nav("/admin/add-vehicle")}>+ Add New</button>
      </div>
      <div className="table-container">
        <table className="table table-striped">
          <thead>
            <tr><th>Driver</th><th>From</th><th>To</th><th>Date</th><th>Type</th><th>Price</th><th>Seats</th><th>Actions</th></tr>
          </thead>
          <tbody>{list.map(v => (
            <tr key={v.id}>
              <td>
                <span style={{ fontWeight: 'bold' }}>{v.driverName || "Unknown"}</span>
                <br /><small className="text-muted">{v.driverEmail}</small>
              </td>
              <td>{v.fromLocation}</td>
              <td>{v.toLocation}</td>
              <td>{v.date}</td>
              <td>{v.vehicleType}</td>
              <td>₹{v.price}</td>
              <td>{v.tickets}</td>
              <td>
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => nav(`/admin/edit-vehicle/${v.id}`)}>Edit</button>
                  <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => remove(v.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default VehiclesList;
