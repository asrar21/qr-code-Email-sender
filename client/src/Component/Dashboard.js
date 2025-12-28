import React, { useEffect, useState, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Subscription from "./Subscription";
import QrTracking from "./QrTracking";
import QrCodeGeneratorComponent from "./qrCodeGeneratorComponent";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const subscriptionSectionRef = useRef(null);

  // Function to scroll to subscription section
  const scrollToSubscription = () => {
    if (subscriptionSectionRef.current) {
      subscriptionSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Add a highlight effect
      subscriptionSectionRef.current.style.backgroundColor = '#f3f4f6';
      setTimeout(() => {
        if (subscriptionSectionRef.current) {
          subscriptionSectionRef.current.style.backgroundColor = '';
        }
      }, 2000);
    }
  };

  // Function to pass to child components
  const handleUpgradeClick = () => {
    scrollToSubscription();
  };

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
  }, [navigate]);

  return (
    <div className="dashboard">
      {/* Pass user to Header */}
      <Header />

      <main className="dashboard-content">
        <section className="dashboard-section">
          {/* Pass handleUpgradeClick to QR component */}
          <QrCodeGeneratorComponent onUpgradeClick={handleUpgradeClick} />
        </section>

        <section className="dashboard-section">
          <h2>Your QR Analytics</h2>
          <QrTracking />
        </section>

        {/* Add ref to subscription section */}
        <section 
          className="dashboard-section" 
          ref={subscriptionSectionRef}
          style={{
            transition: 'background-color 0.5s ease'
          }}
        >
          <h2>Upgrade Your Plan</h2>
          <Subscription />
        </section>
      </main>

      <Footer />
    </div>
  );
}