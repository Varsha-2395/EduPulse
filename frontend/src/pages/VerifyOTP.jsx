import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "../styles/verifyOTP.css";

const VerifyOTP = () => {
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    // dummy verification – backend later
    navigate("/set-password");
  };

  return (
    <div className="otp-container">
      <div className="otp-card">

        {/* Header */}
        <div className="otp-header">
          <img
            src="/EduPulse.png"
            alt="EduPulse Logo"
            className="otp-logo"
          />
          <p className="tagline">
            Enter the OTP sent to your registered email
          </p>
        </div>

        {/* OTP Form */}
        <form className="otp-form" onSubmit={handleVerify}>
          <label>One Time Password (OTP)</label>

          <div className="input-wrapper">
            <ShieldCheck className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              pattern="[0-9]{6}"
              title="OTP must be 6 digits"
              required
            />
          </div>

          <button type="submit" className="verify-btn">
            Verify OTP
          </button>
        </form>

        {/* Resend */}
        <div className="resend">
          Didn’t receive OTP? <span>Resend</span>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
