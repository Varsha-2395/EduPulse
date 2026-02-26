import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "../styles/verifyOTP.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { otp, regNo } = location.state || {};

  const [enteredOTP, setEnteredOTP] = useState("");
  const [error, setError] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();

    if (!otp) {
      setError("OTP expired. Please resend.");
      return;
    }

    if (enteredOTP !== otp) {
      setError("Invalid OTP ❌");
      return;
    }

    console.log("OTP Verified 😌🔥");

    navigate("/set-password", { state: { regNo } });
  };

  return (
    <div className="otp-container">
      <div className="otp-card">

        <div className="otp-header">
          <img src="/EduPulse.png" alt="EduPulse Logo" className="otp-logo" />
          <p className="tagline">
            Enter the OTP sent to your registered email
          </p>
        </div>

        <form className="otp-form" onSubmit={handleVerify}>

          {error && <div className="error-box">{error}</div>}

          <label>One Time Password (OTP)</label>

          <div className="input-wrapper">
            <ShieldCheck className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              value={enteredOTP}
              onChange={(e) => {
                setEnteredOTP(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          <button type="submit" className="verify-btn">
            Verify OTP
          </button>
        </form>

        <div className="resend">
          Didn’t receive OTP? <span>Resend</span>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;