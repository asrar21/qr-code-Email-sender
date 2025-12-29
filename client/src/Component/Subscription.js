import React, { useState, useEffect } from "react";
import "./Dashboard.css";

export default function Subscription({limitCrossed}) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
      fetchCurrentSubscription();
  }, []);
   useEffect(() => {
      fetchPlans()
  }, [currentPlan]);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/subscriptions/plans", {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPlans(data.plans);
        }
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/subscriptions/my-subscription", {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentPlan(data.subscription.tier);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleSubscribe = async (planId) => {
   
    
    setUpgrading(planId);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/subscriptions/subscribe", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert(`Successfully subscribed to ${data.subscription.tier} plan!`);
          setCurrentPlan(planId);
          window.location.reload(); // Refresh to update QR limits
        }
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Error subscribing. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading plans...</div>;
  }

  const subscriptionPlans = plans.length > 0 ? plans : [
    {
      id: 'free',
      tier: 'Free',
      price: 0,
      qrCodesLimit: 3,
      features: ['3 QR Codes', 'Basic Colors', 'No Branding'],
      description: 'Perfect for getting started'
    },
    {
      id: 'basic',
      tier: 'Basic',
      price: 299,
      qrCodesLimit: 50,
      features: ['50 QR Codes', 'Custom Colors', 'Basic Analytics'],
      description: 'For growing usage'
    },
    {
      id: 'premium',
      tier: 'Premium',
      price: 999,
      qrCodesLimit: 200,
      features: ['200 QR Codes', 'Priority Support', 'API Access', 'Custom Branding'],
      description: 'For professionals'
    }
  ];

  return (
    <div className="pricing-grid">
      {subscriptionPlans.map((plan) => (
        <div 
          key={plan.id} 
          className={`pricing-card ${plan.tier === 'Basic' ? 'popular' : ''}`}
        >
          {plan.tier === 'Basic' && (
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#4f46e5',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              MOST POPULAR
            </div>
          )}
         
          <h3>{plan.tier}</h3>
          <p className="price">₹{plan.price}<span style={{ fontSize: '14px', color: '#6b7280' }}>/mo</span></p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            {plan.qrCodesLimit} QR Codes
          </p>
          
          <ul>
            {plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          
          
          
          {currentPlan === plan.id ? (
            <div>
            <button 
              style={{ 
                background: '#10b981',
                cursor: 'default'
              }}
              disabled
            >
              Current Plan
            </button>
            {limitCrossed && plan.tier !== 'free' && (<div>
               <button 
               onClick={() => handleSubscribe(plan.id)}
              style={{
                opacity: upgrading === plan.id ? 0.6 : 1,
                cursor: upgrading === plan.id ? 'not-allowed' : 'pointer'
              }}
            >
              {upgrading === plan.id ? 'Processing...' : 'Upgrade again'}
            </button>
            </div>)}
            
            </div>
          ) :  (
            <button 
              onClick={() => handleSubscribe(plan.id)}
              disabled={upgrading === plan.id || plan.tier === 'free' }
              style={{
                opacity: upgrading === plan.id ? 0.6 : 1,
                cursor: upgrading === plan.id ? 'not-allowed' : 'pointer'
              }}
            >
              {upgrading === plan.id ? 'Processing...' : 'Upgrade'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}