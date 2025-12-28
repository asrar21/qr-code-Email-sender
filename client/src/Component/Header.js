import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="header">
      <h3>QRify</h3>

      <div className="user-area">
        {/* <span>{user?.name}</span> */}
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
