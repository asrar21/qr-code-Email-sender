import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Subscription from "./Subscription";
import QrTracking from "./QrTracking";
import QrCodeGeneratorComponent from "./qrCodeGeneratorComponent";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Header />

      <main className="dashboard-content">
        <section className="dashboard-section">
         <QrCodeGeneratorComponent />
        
        </section>

        <section className="dashboard-section">
          <h2>Your QR Analytics</h2>
          <QrTracking />
        </section>

        <section className="dashboard-section">
          <h2>Upgrade Your Plan</h2>
          <Subscription />
        </section>
      </main>

      <Footer />
    </div>
  );
}
