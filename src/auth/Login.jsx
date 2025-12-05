import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJWT } from "../utils/jwt";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) return setError("Invalid credentials");

    if (user.role === "pending-admin") {
      return setError("Your admin access is pending approval. Login as user for now.");
    }

    const token = createJWT(user);
    localStorage.setItem("token", token);

    if (user.role === "admin") navigate("/dashboard");
    else navigate("/user-rides");
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
