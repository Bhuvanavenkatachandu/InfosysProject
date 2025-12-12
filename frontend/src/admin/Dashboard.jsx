// src/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, getToken, verifyJWT } from "../utils/jwt";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, drivers: 0, vehicles: 0, bookings: 0 });
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
        // fetch users
        const users = await apiFetch("/api/admin/users");
        // fetch vehicles
        const vehicles = await apiFetch("/api/vehicles");
        // fetch all bookings (admin-only)
        const bookings = await apiFetch("/api/bookings");

        setStats({
          users: Array.isArray(users) ? users.filter(u => u.role !== 'driver').length : 0, // Count only regular users? Or separate them. Let's separate.
          drivers: Array.isArray(users) ? users.filter(u => u.role === 'driver').length : 0,
          vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
          bookings: Array.isArray(bookings) ? bookings.length : 0,
        });
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="container">
      <h2>Ride Share Admin Dashboard</h2>
      <p>Manage users, rides, and bookings.</p>

      {loading ? (
        <p>Loading stats…</p>
      ) : error ? (
        <p className="validation-msg error">Error: {error}</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            <div className="card text-center">
              <h3>Total Users</h3>
              <p className="text-large">{stats.users}</p>
            </div>
            <div className="card text-center">
              <h3>Total Drivers</h3>
              <p className="text-large">{stats.drivers}</p>
            </div>
            <div className="card text-center">
              <h3>Total Rides</h3>
              <p className="text-large">{stats.vehicles}</p>
            </div>
            <div className="card text-center">
              <h3>Total Bookings</h3>
              <p className="text-large">{stats.bookings}</p>
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
