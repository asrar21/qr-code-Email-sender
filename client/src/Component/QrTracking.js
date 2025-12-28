import React from "react";
import "./Dashboard.css";

export default function QrTracking() {
  return (
    <div className="tracking-grid">
      <div className="stat-card">
        <h4>Total Scans</h4>
        <p>1,248</p>
      </div>

      <div className="stat-card">
        <h4>Active QR Codes</h4>
        <p>12</p>
      </div>

      <div className="stat-card">
        <h4>Last Scan</h4>
        <p>2 hours ago</p>
      </div>
    </div>
  );
}
