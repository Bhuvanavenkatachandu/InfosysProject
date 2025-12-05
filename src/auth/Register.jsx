import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePassword } from "../utils/passwordGenerator";
import { sendEmail } from "../utils/emailService";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const superAdminEmail = localStorage.getItem("superAdminEmail") || null;

    if (users.find((u) => u.email === email)) {
      return setMessage("User already exists!");
    }

    const adminExists = users.some((u) => u.role === "admin");
    let finalRole = role;
    let requestedAdmin = false;

    if (role === "admin") {
      if (!adminExists) {
        // First admin ever -> super admin
        finalRole = "admin";
        localStorage.setItem("superAdminEmail", email);
      } else {
        // Others requesting admin
        finalRole = "pending-admin";
        requestedAdmin = true;
      }
    }

    const newUser = { name, email, password, role: finalRole, requestedAdmin };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    sendEmail(email, "Welcome to Ride Share", `Your password: ${password}`);

    if (finalRole === "pending-admin") {
      setMessage("Registered as user. Admin approval is required for admin role.");
    } else {
      setMessage("Registered successfully!");
    }

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const adminExists = users.some((u) => u.role === "admin");

  return (
    <div className="container">
      <form className="form" onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {!adminExists && <option value="admin">Admin (first admin)</option>}
          <option value="user">User</option>
          {adminExists && <option value="admin">Request Admin Access</option>}
        </select>

        <button type="submit">Register</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default Register;
