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
  const [limitCrossed,setLimitCrossed] = useState(false)
  const subscriptionSectionRef = useRef(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Check if user is admin
        if (userData.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        navigate("/login");
        console.error("Invalid user data in localStorage");
      }
    }
  }, [navigate]);
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
   const handleLimitCrossed = () => {
    setLimitCrossed(true);
  };

 

  return (
    <div className="dashboard">
      {/* Pass user to Header */}
      <Header />
 
      <main className="dashboard-content">
        {isAdmin  ? (
          <section className="dashboard-section">
            <h2>📊 QR Analytics (Admin Only)</h2>
            <QrTracking />
          </section>
        ):(<div> <section className="dashboard-section">
          {/* Pass handleUpgradeClick to QR component */}
          <QrCodeGeneratorComponent onUpgradeClick={handleUpgradeClick} limitCrossed={handleLimitCrossed} />
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
          <Subscription limitCrossed = {limitCrossed}/>
        </section></div>)}
       
      </main>

      <Footer />
    </div>
  );
}