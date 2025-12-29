import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    countryCode: "+1", // Default US code
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country codes for dropdown
  const countryCodes = [
    { code: "+1", country: "US/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+86", country: "China" },
    { code: "+33", country: "France" },
    { code: "+49", country: "Germany" },
    { code: "+81", country: "Japan" },
    { code: "+82", country: "South Korea" },
    { code: "+61", country: "Australia" },
    { code: "+55", country: "Brazil" },
    { code: "+7", country: "Russia" },
    { code: "+20", country: "Egypt" },
    { code: "+27", country: "South Africa" },
    { code: "+34", country: "Spain" },
    { code: "+39", country: "Italy" },
    { code: "+52", country: "Mexico" },
    { code: "+90", country: "Turkey" },
    { code: "+92", country: "Pakistan" },
    { code: "+62", country: "Indonesia" },
    { code: "+63", country: "Philippines" }
  ];

  // Validation regex patterns
  const validationPatterns = {
    username: /^[a-zA-Z0-9_]{3,20}$/, // 3-20 chars, alphanumeric + underscore
    name: /^[a-zA-Z\s]{2,50}$/, // 2-50 chars, letters and spaces
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
    phoneNumber: /^[0-9]{7,15}$/, // 7-15 digits
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/ // Min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch(name) {
      case 'username':
        if (!value) error = "Username is required";
        else if (!validationPatterns.username.test(value)) 
          error = "Username must be 3-20 characters (letters, numbers, underscore)";
        break;
      
      case 'name':
        if (!value) error = "Full name is required";
        else if (!validationPatterns.name.test(value)) 
          error = "Name must be 2-50 characters (letters and spaces only)";
        break;
      
      case 'email':
        if (!value) error = "Email is required";
        else if (!validationPatterns.email.test(value)) 
          error = "Please enter a valid email address";
        break;
      
      case 'phoneNumber':
        if (!value) error = "Phone number is required";
        else if (!validationPatterns.phoneNumber.test(value)) 
          error = "Phone number must be 7-15 digits";
        break;
      
      case 'password':
        if (!value) error = "Password is required";
        else if (!validationPatterns.password.test(value)) 
          error = "Password must be at least 6 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character";
        break;
      
      case 'confirmPassword':
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) 
          error = "Passwords do not match";
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleCountryCodeChange = (e) => {
    setFormData({
      ...formData,
      countryCode: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'countryCode') { // Skip country code from validation
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Combine country code and phone number
      const mobileNumber = formData.countryCode + formData.phoneNumber;
      // console.log("user DAta", JSON.stringify({
      //     username: formData.username,
      //     name: formData.name,
      //     email: formData.email,
      //     mobileNumber: mobileNumber,
      //     password: formData.password
      //   }))
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          mobileNumber: mobileNumber,
          password: formData.password
        })
      });

      const data = await response.json();
// console.log("user response",data)
      if (response.ok && data.success) {
        // Save token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        setErrors({
          ...errors,
          server: data.error || data.message || "Signup failed"
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        ...errors,
        server: "Network error. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Start generating QR codes today</p>

        {errors.server && (
          <div className="error-message" style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '15px' 
          }}>
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSignup}>
          {/* Username Field */}
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
            />
            {errors.username && <div className="error-text">{errors.username}</div>}
            <small className="hint">3-20 characters (letters, numbers, underscore)</small>
          </div>

          {/* Full Name Field */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          {/* Mobile Number Field */}
          <div className="form-group">
            <label>Mobile Number *</label>
            <div className="phone-input-group">
              <select 
                value={formData.countryCode}
                onChange={handleCountryCodeChange}
                className="country-code-select"
              >
                {countryCodes.map((country, index) => (
                  <option key={index} value={country.code}>
                    {country.code} ({country.country})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="1234567890"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`phone-number-input ${errors.phoneNumber ? "error" : ""}`}
              />
            </div>
            {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
            <small className="hint">Enter your phone number without country code</small>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password *</label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              <span 
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
            {errors.password && <div className="error-text">{errors.password}</div>}
            <small className="hint">Min 6 chars: 1 uppercase, 1 lowercase, 1 number, 1 special</small>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label>Confirm Password *</label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
              />
              <span 
                className="password-toggle-icon"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          {/* Terms and Conditions */}
          <div className="terms-group">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <span onClick={() => navigate("/login")} className="auth-link">
            Already have an account? <strong>Login</strong>
          </span>
        </div>
      </div>
    </div>
  );
}