import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    // if (user?.email === email && user?.password === password) {
    //   localStorage.setItem("isAuth", "true");
    //   navigate("/dashboard");
    // } else {
    //   alert("Invalid credentials");
    // }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your dashboard</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button>Login</button>
        </form>
      </div>
    </div>
  );
}
