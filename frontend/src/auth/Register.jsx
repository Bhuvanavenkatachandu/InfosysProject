// src/auth/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8084";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", confirmPassword: "", gender: "Male", profileImage: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");

    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          gender: form.gender,
          profileImage: form.profileImage
        })
      });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) { data = text; }

      if (!res.ok) {
        console.error("Register failed:", res.status, data);
        const errorMsg = (typeof data === 'object' && data?.error) ? data.error : (typeof data === 'string' ? data : `Error ${res.status}`);
        setErr(errorMsg);
        return;
      }

      setMsg("Registration successful! Redirecting...");
      setTimeout(() => nav("/login"), 1500);
    } catch (networkError) {
      console.error("Network/register error:", networkError);
      setErr(networkError.message || "Network error: could not reach server.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 className="mb-4 text-center">Create Account</h2>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" placeholder="Enter your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Create password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">Gender</label>
              <select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Role</label>
              <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">Passenger</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Profile Picture URL (Optional)</label>
            <input
              className="input"
              type="text"
              placeholder="https://..."
              value={form.profileImage}
              onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
        </form>
        {msg && <p className="validation-msg success text-center mt-2">{msg}</p>}
        {err && <p className="validation-msg error text-center mt-2">{err}</p>}

        <p className="text-center mt-4">
          Already have an account? <a href="/login" style={{ color: 'var(--color-primary)' }}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
