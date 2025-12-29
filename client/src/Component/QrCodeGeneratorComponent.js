import React, { useState, useEffect } from "react";
import "./qrCodeGeneratorCss.css";

let initialValues = {
  qrText: "",
  qrColor: ""
};

let colors = [
  { id: 1, color: "#DFFF00", selected: false },
  { id: 2, color: "#FFBF00", selected: false },
  { id: 3, color: "#FF7F50", selected: false },
  { id: 4, color: "#CCCCFF", selected: false },
  { id: 5, color: "#0000FF", selected: false },
  { id: 6, color: "#808000", selected: false },
  { id: 7, color: "#800000", selected: false },
  { id: 8, color: "#808080", selected: false },
];

export default function QrCodeGenerator({ onUpgradeClick,limitCrossed }) {
  const [fieldValues, setFieldValues] = useState({ ...initialValues });
  const [palette, setPalette] = useState([...colors]);
  const [loader, setLoader] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [alertError, setAlertError] = useState(null);
  const [errors, setErrors] = useState({});
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrId, setQrId] = useState(null);
  const [usage, setUsage] = useState({ current: 0, limit: 3, remaining: 3 });
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check remaining QR codes on component mount
  useEffect(() => {
    checkRemainingQRs();
  }, []);

  const checkRemainingQRs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/qr/remaining", {
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsage({
            current: data.used,
            limit: data.limit,
            remaining: data.remaining
          });
          
          if (data.requiresUpgrade) {
            setShowSubscriptionAlert(true);
          }
        }
      }
    } catch (error) {
      console.error("Error checking QR limits:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldValues({ ...fieldValues, [name]: value });
  };

  const selectColor = (id) => {
    const updated = palette.map((c) =>
      c.id === id ? { ...c, selected: true } : { ...c, selected: false }
    );
    const picked = updated.find((c) => c.id === id);

    setFieldValues({ ...fieldValues, qrColor: picked.color });
    setPalette(updated);
  };

  const validate = (obj) => {
    let { qrText, qrColor } = obj;
    let v = { qrText: false, qrColor: false };

    if (!qrText) v.qrText = true;
    if (!qrColor) v.qrColor = true;

    return v;
  };

  const submitForm = async () => {
    let v = validate(fieldValues);
    let noError = Object.values(v).every((e) => e === false);

    if (!noError) {
      setErrors({ ...v });
      return;
    }

    setErrors({});
    setLoader(true);
    setIsGenerating(true);
    setAlertSuccess(null);
    setAlertError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAlertError("Please login first");
        setLoader(false);
        setIsGenerating(false);
        return;
      }

      let res = await fetch("http://localhost:5000/api/qr/generate", {
        method: "POST",
        body: JSON.stringify({
          qrText: fieldValues.qrText,
          qrColor: fieldValues.qrColor
        }),
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      let data = await res.json();
      setLoader(false);
      setIsGenerating(false);

      if (data.success) {
        setAlertSuccess(data.message);
        setQrCodeData(data.qrCode);
        setQrId(data.qrId);
        setUsage(data.usage);
        
        if (data.subscription && data.subscription.requiresUpgrade) {
          setShowSubscriptionAlert(true);
        }
        
        setTimeout(() => setAlertSuccess(null), 4000);
      } else {
        if (data.requiresSubscription) {
          setShowSubscriptionAlert(true);
        }
        setAlertError(data.error || data.message || "Something went wrong!");
        setTimeout(() => setAlertError(null), 4000);
      }
    } catch (err) {
      setLoader(false);
      setIsGenerating(false);
      setAlertError("Network error. Please try again.");
      setTimeout(() => setAlertError(null), 4000);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeData) return;
    
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Update download count in backend
    if (qrId) {
      fetch(`http://localhost:5000/api/qr/download/${qrId}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      }).catch(console.error);
    }
  };

  const resetForm = () => {
    setFieldValues({ ...initialValues });
    const resetPalette = palette.map(c => ({ ...c, selected: false }));
    setPalette(resetPalette);
    setQrCodeData(null);
    setQrId(null);
    setErrors({});
    setAlertSuccess(null);
    setAlertError(null);
  };

  const resetColors = () => {
    const resetPalette = palette.map(c => ({ ...c, selected: false }));
    setPalette(resetPalette);
    setFieldValues({ ...fieldValues, qrColor: "" });
  };
  const handleUpgradeNow = () =>{
    onUpgradeClick()
    limitCrossed()
  }

  return (
    <div className="qr-wrapper">
      {loader && <div className="loader"></div>}

      {alertSuccess && <div className="alert success">{alertSuccess}</div>}
      {alertError && <div className="alert error">{alertError}</div>}

      {/* Subscription Alert */}
      {showSubscriptionAlert && (
        <div className="alert subscription-alert" style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fbbf24',
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span>⚠️ You've used {usage.current}/{usage.limit} free QR codes.</span>
            <button 
              onClick={handleUpgradeNow}  
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Usage Counter */}
      <div style={{
        background: '#f9fafb',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#111827' }}>
          <span style={{ fontWeight: '600' }}>QR Codes Used:</span> 
          <span style={{ 
            color: usage.remaining <= 1 ? '#ef4444' : '#059669',
            fontWeight: 'bold',
            margin: '0 5px'
          }}>
            {usage.current}/{usage.limit}
          </span>
          ({usage.remaining} remaining)
        </p>
      </div>

      <div className="card">
        {/* Input Field */}
        <label className="label">
          Text you want to convert into a QR <span className="req">*</span>
        </label>
        <input
          type="text"
          name="qrText"
          className="input"
          placeholder="Enter text or URL..."
          value={fieldValues.qrText}
          onChange={handleChange}
          disabled={isGenerating || usage.remaining <= 0}
        />
        {errors.qrText && <p className="error-text">This field is required</p>}

        {/* Color Picker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label className="label">Pick QR Color <span className="req">*</span></label>
          {fieldValues.qrColor && (
            <button 
              onClick={resetColors}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Reset Color
            </button>
          )}
        </div>

        <div className="color-grid">
          {palette.map((c) => (
            <div
              key={c.id}
              className={`color-box ${c.selected ? "selected" : ""}`}
              style={{ background: c.color }}
              onClick={() => !isGenerating && usage.remaining > 0 && selectColor(c.id)}
            ></div>
          ))}
        </div>

        {errors.qrColor && (
          <p className="error-text">Please select a color</p>
        )}

        {/* Selected Color Preview */}
        {fieldValues.qrColor && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '15px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '6px'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#111827' }}>Selected Color:</p>
            <div 
              style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '4px',
                background: fieldValues.qrColor,
                border: '2px solid #e5e7eb'
              }}
            ></div>
            <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#111827' }}>
              {fieldValues.qrColor}
            </span>
          </div>
        )}

        <button 
          className="submit-btn" 
          onClick={submitForm} 
          disabled={isGenerating || usage.remaining <= 0}
          style={{
            opacity: (isGenerating || usage.remaining <= 0) ? 0.6 : 1,
            cursor: (isGenerating || usage.remaining <= 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? "Generating..." : usage.remaining <= 0 ? "Upgrade Required" : "Generate QR Code"}
        </button>

        {/* QR Code Preview */}
        {qrCodeData && (
          <div style={{ 
            marginTop: '30px', 
            paddingTop: '20px', 
            borderTop: '2px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#111827', marginBottom: '15px' }}>Your QR Code</h3>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              margin: '20px 0',
              padding: '20px',
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <img 
                src={qrCodeData} 
                alt="Generated QR Code" 
                style={{ 
                  maxWidth: '200px',
                  maxHeight: '200px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={downloadQRCode}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Download QR Code
              </button>
              <button 
                onClick={resetForm}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}