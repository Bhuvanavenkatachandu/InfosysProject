import { Link, useNavigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = verifyJWT(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>RIDE SHARE</h1>
      </div>

      <nav className="topbar-right">
        {!user && (
          <>
            <Link className="topbar-link" to="/login">
              Login
            </Link>
            <Link className="topbar-link" to="/register">
              Register
            </Link>
          </>
        )}

        {user && user.role === "user" && (
          <>
            <Link className="topbar-link" to="/user-rides">
              Rides
            </Link>
            <Link className="topbar-link" to="/my-bookings">
              My Bookings
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <Link className="topbar-link" to="/dashboard">
              Dashboard
            </Link>
            <Link className="topbar-link" to="/admin/users">
              Users
            </Link>
            <Link className="topbar-link" to="/admin/add-vehicle">
              Add Ride
            </Link>
            <Link className="topbar-link" to="/admin/vehicles">
              All Rides
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
