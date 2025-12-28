import React from "react";
import "./Dashboard.css";

export default function Subscription() {
  return (
    <div className="pricing-grid">
      <div className="pricing-card">
        <h3>Free</h3>
        <p className="price">₹0</p>
        <ul>
          <li>5 QR Codes</li>
          <li>Basic Analytics</li>
          <li>No Branding</li>
        </ul>
        <button>Current Plan</button>
      </div>

      <div className="pricing-card popular">
        <h3>Pro</h3>
        <p className="price">₹999 / mo</p>
        <ul>
          <li>Unlimited QR Codes</li>
          <li>Advanced Tracking</li>
          <li>Custom Branding</li>
        </ul>
        <button>Upgrade</button>
      </div>

      <div className="pricing-card">
        <h3>Business</h3>
        <p className="price">₹1999 / mo</p>
        <ul>
          <li>Team Access</li>
          <li>API Access</li>
          <li>Priority Support</li>
        </ul>
        <button>Upgrade</button>
      </div>
    </div>
  );
}
