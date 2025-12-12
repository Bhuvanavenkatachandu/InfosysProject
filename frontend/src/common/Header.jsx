import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyJWT, getToken } from "../utils/jwt";
import "./Header.css"; // if you have it; otherwise ignore

const Header = () => {
  const navigate = useNavigate();
  const user = verifyJWT(getToken());
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Check initial preference
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.body.classList.add("dark-mode");
      setIsDark(true);
    } else {
      document.body.classList.add("light-mode");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ position: 'relative', fontFamily: "'Righteous', cursive", letterSpacing: '1px', fontSize: '1.5rem' }}>
        {/* Inject Font */}
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');
        </style>
        <strong style={{ background: 'linear-gradient(45deg, var(--color-primary), var(--color-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          RIDE SHARE
        </strong>

        {/* Hanging Bulb Rope */}
        <div style={{
          position: 'absolute',
          left: '30px', /* Adjust to hang from a letter */
          top: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          cursor: 'pointer',
          animation: 'swing 3s ease-in-out infinite'
        }} onClick={toggleTheme}>
          {/* The Rope */}
          <div style={{
            width: '2px',
            height: '40px',
            backgroundColor: 'var(--color-text-main)',
            opacity: 0.5
          }}></div>
          {/* The Bulb */}
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: isDark ? '#444' : '#ffeb3b',
            boxShadow: isDark ? 'none' : '0 0 10px #ffeb3b, 0 0 20px #ffeb3b',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s ease'
          }}></div>
        </div>
        <style>{`
            @keyframes swing {
                0% { transform: rotate(5deg); transform-origin: top center; }
                50% { transform: rotate(-5deg); transform-origin: top center; }
                100% { transform: rotate(5deg); transform-origin: top center; }
            }
        `}</style>

      </div>
      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="nav-item">Register</Link>
          </>
        )}
        {user && user.role === "user" && (
          <>
            <Link to="/user-rides" className="nav-item">Rides</Link>
            <Link to="/my-bookings" className="nav-item">My Bookings</Link>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '14px' }}>Logout</button>
          </>
        )}
        {user && user.role === "admin" && (
          <>
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <Link to="/admin/users" className="nav-item">Users</Link>
            <Link to="/admin/vehicles" className="nav-item">All Rides</Link>
            <span className="nav-item" style={{ opacity: 0.7, fontSize: '0.9rem' }}>{user.name || "Admin"}</span>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '14px' }}>Logout</button>
          </>
        )}
        {user && user.role === "driver" && (
          <>
            <Link to="/driver-dashboard" className="nav-item">Dashboard</Link>
            <Link to="/driver/add-ride" className="nav-item">Post Ride</Link>
            <span className="nav-item" style={{ opacity: 0.7, fontSize: '0.9rem' }}>{user.name || "Driver"}</span>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '14px' }}>Logout</button>
          </>
        )}
        {user && user.role === "user" && (
          <div className="flex items-center gap-2 nav-item">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</span>
            )}
            <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>{user.name}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
