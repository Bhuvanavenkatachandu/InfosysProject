// src/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, getToken, verifyJWT } from "../utils/jwt";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0, drivers: 0, vehicles: 0, bookings: 0,
    cancelledBookings: 0, totalVolume: 0, totalRides: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // New Endpoint
        const data = await apiFetch("/api/admin/users/stats/detailed");
        setStats({
          users: data.userCount,
          drivers: data.driverCount,
          vehicles: data.totalRides,
          bookings: data.totalBookings,
          cancelledBookings: data.cancelledBookings,
          totalVolume: data.totalVolume,
          totalRides: data.totalRides
        });
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <p className="text-muted">Monitor platform performance.</p>

      {loading ? (
        <p>Loading stats…</p>
      ) : error ? (
        <p className="validation-msg error">Error: {error}</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="card text-center text-primary">
              <h3>{stats.users}</h3>
              <p>Users</p>
            </div>
            <div className="card text-center text-success">
              <h3>{stats.drivers}</h3>
              <p>Drivers</p>
            </div>
            <div className="card text-center text-secondary">
              <h3>{stats.vehicles}</h3>
              <p>Total Rides</p>
            </div>
            <div className="card text-center text-warning">
              <h3>{stats.bookings}</h3>
              <p>Bookings</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card bg-light">
              <h4>Platform Earnings (Volume)</h4>
              <p className="text-large text-success font-bold">₹{stats.totalVolume.toLocaleString()}</p>
            </div>
            <div className="card bg-light">
              <h4>Cancellations & Disputes</h4>
              <p className="text-large text-danger font-bold">{stats.cancelledBookings}</p>
              <p className="text-small text-muted">{(stats.cancelledBookings / (stats.bookings || 1) * 100).toFixed(1)}% Rate</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Link className="btn btn-primary" to="/admin/users">
              Manage Users
            </Link>
            <Link className="btn btn-outline" to="/admin/vehicles">
              Manage Rides
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
