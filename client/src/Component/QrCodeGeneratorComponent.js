import React, { useState } from "react";
import "./qrCodeGeneratorCss.css";

let initialValues = {
  qrText: "",
  qrEmail: "",
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
export default function  QrCodeGenerator() {
  const [fieldValues, setFieldValues] = useState({ ...initialValues });
  const [palette, setPalette] = useState([...colors]);
  const [loader, setLoader] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [alertError, setAlertError] = useState(null);
  const [errors, setErrors] = useState({});

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
    let { qrText, qrEmail, qrColor } = obj;
    let v = { qrText: false, qrEmail: false, qrColor: false, message: false };

    if (!qrText) v.qrText = true;

    if (!qrEmail) v.qrEmail = true;
    else {
      let pattern =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      if (!pattern.test(qrEmail)) {
        v.qrEmail = true;
        v.message = "Invalid email address";
      }
    }

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

    try {
      let res = await fetch(
        "https://qr-code-backend-pi.vercel.app/qr-code-generate",
        {
          method: "POST",
          body: JSON.stringify(fieldValues),
          headers: { "Content-Type": "application/json" },
        }
      );

      let data = await res.json();
      setLoader(false);

      if (data.status === 400) {
        setAlertError(data.message);
        setTimeout(() => setAlertError(null), 4000);
      } else {
        setAlertSuccess(data.message);
        setTimeout(() => setAlertSuccess(null), 4000);
      }
    } catch (err) {
      setLoader(false);
      setAlertError("Something went wrong!");
    }
  };

  return (
    <div className="qr-wrapper">
      {loader && <div className="loader"></div>}

      {alertSuccess && <div className="alert success">{alertSuccess}</div>}
      {alertError && <div className="alert error">{alertError}</div>}

      <div className="card">

        {/* Input Field */}
        <label className="label">
          Text you want to convert into a QR <span className="req">*</span>
        </label>
        <input
          type="text"
          name="qrText"
          className="input"
          placeholder="Enter text..."
          value={fieldValues.qrText}
          onChange={handleChange}
        />
        {errors.qrText && <p className="error-text">This field is required</p>}

        {/* Email Field */}
        <label className="label">
          Your Email Address <span className="req">*</span>
        </label>
        <input
          type="text"
          name="qrEmail"
          className="input"
          placeholder="Enter your email..."
          value={fieldValues.qrEmail}
          onChange={handleChange}
        />
        {errors.qrEmail && (
          <p className="error-text">{errors.message || "This field is required"}</p>
        )}

        {/* Color Picker */}
        <label className="label">Pick QR Background Color <span className="req">*</span></label>

        <div className="color-grid">
          {palette.map((c) => (
            <div
              key={c.id}
              className={`color-box ${c.selected ? "selected" : ""}`}
              style={{ background: c.color }}
              onClick={() => selectColor(c.id)}
            ></div>
          ))}
        </div>

        {errors.qrColor && (
          <p className="error-text">Please select a color</p>
        )}

        <button className="submit-btn" onClick={submitForm}>
          Submit
        </button>
      </div>
    </div>
  );
}



