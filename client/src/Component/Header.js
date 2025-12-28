
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Header() {
  const navigate = useNavigate();
   const [user, setUser] = useState(null);
 useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        navigate("/login");
        console.error("Invalid user data in localStorage");
      }
    }
  }, []);
  const logout = () => {
    localStorage.removeItem("user"); // clear only user
    navigate("/login");
  };

  // Get first letter of username
  const firstLetter = user && user.name
    ? user.name.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="header">
      <h3>QRify</h3>

      <div className="user-area">
        {/* User Icon */}
        <div className="user-avatar">
          {firstLetter}
        </div>

        {/* Username */}
        <span className="username">
          {user&& user.name}
        </span>

        {/* Logout */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
