import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    localStorage.setItem(
      "user",
      JSON.stringify({ name, email, password })
    );

    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Start generating QR codes</p>

        <form onSubmit={handleSignup}>
          <input
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <button>Create Account</button>
        </form>

        <span onClick={() => navigate("/login")}>
          Already have an account? Login
        </span>
      </div>
    </div>
  );
}
