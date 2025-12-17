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
      if (user.role === "admin") nav("/dashboard");
      else if (user.role === "driver") nav("/driver-dashboard");
      else nav("/user-rides");
    }
  }, [nav]);

  const handleLogin = async (e) => {
    e.preventDefault(); setErr("");
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Login failed"); return; }
      saveToken(data.token);
      if (data.role === "admin") nav("/dashboard");
      else if (data.role === "driver") nav("/driver-dashboard");
      else nav("/user-rides");
    } catch (error) { setErr(error.message || "Network error"); }
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
