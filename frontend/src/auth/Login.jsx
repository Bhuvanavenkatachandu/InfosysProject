import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken, verifyJWT } from "../utils/jwt";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8084";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const user = verifyJWT();
    if (user) {
      // Validate with server to prevent stale token redirect loops
      apiFetch("/api/auth/me")
        .then(data => {
          const role = data.role ? data.role.toLowerCase() : "user";
          if (role === "admin") nav("/dashboard");
          else if (role === "driver") nav("/driver-dashboard");
          else nav("/user-rides");
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, [nav]);

  const handleLogin = async (e) => {
    e.preventDefault(); setErr("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) { data = text; }

      if (!res.ok) {
        console.error("Login failed:", res.status, data);
        setErr((typeof data === 'object' && data?.error) ? data.error : "Login failed");
        return;
      }

      saveToken(data.token);
      const role = data.role ? data.role.toLowerCase() : "user";
      if (role === "admin") nav("/dashboard");
      else if (role === "driver") nav("/driver-dashboard");
      else nav("/user-rides");
    } catch (error) {
      console.error("Login error:", error);
      setErr(error.message || "Network error");
    }
  };
  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
        {err && <p className="validation-msg error text-center mt-4">{err}</p>}
      </div>
    </div>
  );
};

export default Login;
