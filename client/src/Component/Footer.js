import React from "react";
import "./Dashboard.css";

export default function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} QRify — All rights reserved
    </footer>
  );
}
