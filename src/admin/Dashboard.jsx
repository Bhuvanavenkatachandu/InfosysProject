import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, vehicles: 0, bookings: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") return navigate("/login");

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const vehicles = JSON.parse(localStorage.getItem("buses")) || [];
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    setStats({
      users: users.length,
      vehicles: vehicles.length,
      bookings: bookings.length,
    });
  }, [navigate]);

  return (
    <div className="container">
      <h2>Ride Share Admin Dashboard</h2>
      <p>Manage users, rides, and bookings.</p>

      <div className="stats-row">
        <div className="stats-card">
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>
        <div className="stats-card">
          <h3>Total Rides</h3>
          <p>{stats.vehicles}</p>
        </div>
        <div className="stats-card">
          <h3>Total Bookings</h3>
          <p>{stats.bookings}</p>
        </div>
      </div>

      <hr style={{ marginTop: "20px", marginBottom: "10px" }} />

      <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
        <Link className="link-button" to="/admin/users">
          Manage Users
        </Link>
        <Link className="link-button" to="/admin/add-vehicle">
          Add Ride
        </Link>
        <Link className="link-button" to="/admin/vehicles">
          All Rides
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
