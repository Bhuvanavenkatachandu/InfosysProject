import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const UserBus = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [search, setSearch] = useState({ from: "", to: "", date: "" });
  const nav = useNavigate();

  useEffect(() => {
    apiFetch("/api/vehicles").then((data) => {
      setBuses(data);
      setFilteredBuses(data);
    }).catch(() => {
      setBuses([]);
      setFilteredBuses([]);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = buses.filter((bus) => {
      const matchFrom = search.from ? bus.fromLocation.toLowerCase().includes(search.from.toLowerCase()) : true;
      const matchTo = search.to ? bus.toLocation.toLowerCase().includes(search.to.toLowerCase()) : true;
      const matchDate = search.date ? bus.date === search.date : true; // Exact match for date
      return matchFrom && matchTo && matchDate;
    });
    setFilteredBuses(filtered);
  };

  const resetSearch = () => {
    setSearch({ from: "", to: "", date: "" });
    setFilteredBuses(buses);
  };

  return (
    <div className="container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Available Rides</h2>
      </div>

      <div className="card mb-4">
        <form onSubmit={handleSearch} className="grid grid-cols-4 gap-2 items-end">
          <div className="form-group mb-0">
            <label className="label">From</label>
            <input
              className="input"
              placeholder="Origin"
              value={search.from}
              onChange={(e) => setSearch({ ...search, from: e.target.value })}
            />
          </div>
          <div className="form-group mb-0">
            <label className="label">To</label>
            <input
              className="input"
              placeholder="Destination"
              value={search.to}
              onChange={(e) => setSearch({ ...search, to: e.target.value })}
            />
          </div>
          <div className="form-group mb-0">
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={search.date}
              onChange={(e) => setSearch({ ...search, date: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" style={{ minWidth: '80px' }}>Search</button>
            <button type="button" className="btn btn-secondary" onClick={resetSearch}>Reset</button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Route</th>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Price</th>
              <th>Seats</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.length > 0 ? (
              filteredBuses.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.imageUrl && (
                      <div style={{ width: '80px', height: '50px', overflow: 'hidden', borderRadius: '8px', marginBottom: '4px' }}>
                        <img src={v.imageUrl} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(v.fromLocation)}&destination=${encodeURIComponent(v.toLocation)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                      title="View on Maps"
                    >
                      <strong>{v.fromLocation}</strong> <span style={{ color: 'var(--color-primary)' }}>→</span> <strong>{v.toLocation}</strong>
                    </a>
                    {v.route && <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>Via: {v.route}</div>}
                  </td>
                  <td>{v.date}</td>
                  <td>
                    <span className="badge secondary">{v.vehicleType}</span>
                  </td>
                  <td>
                    {v.driverName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {v.driverImage ? (
                          <img src={v.driverImage} alt="Driver" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧑‍✈️</div>
                        )}
                        <span style={{ fontWeight: '500' }}>{v.driverName}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{v.price}</td>
                  <td>{v.tickets}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 16px' }}
                      onClick={() => nav(`/book/${v.id}`)}
                    >
                      Book
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted" style={{ padding: '20px' }}>No rides found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserBus;
