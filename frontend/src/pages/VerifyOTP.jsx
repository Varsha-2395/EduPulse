import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "../styles/verifyOTP.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { otp, regNo } = location.state || {};

  const [currentOtp, setCurrentOtp] = useState(otp || "");
  const [enteredOTP, setEnteredOTP] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();

    if (!currentOtp) {
      setError("OTP expired. Please resend.");
      return;
    }

    if (enteredOTP !== currentOtp) {
      setError("Invalid OTP");
      return;
    }

    navigate("/set-password", { state: { regNo } });
  };

  const handleResend = async () => {
    if (!regNo) {
      setError("Register number missing. Go back and try again.");
      return;
    }

    try {
      setIsResending(true);
      setError("");
      setInfo("");

      const res = await fetch("http://localhost:5000/api/students/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend OTP");
        return;
      }

      if (data.otp) {
        setCurrentOtp(String(data.otp));
      }

      setInfo("OTP resent successfully. Check your email.");
    } catch (err) {
      setError("Server error while resending OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <img src="/EduPulse.png" alt="EduPulse Logo" className="otp-logo" />
          <p className="tagline">Enter the OTP sent to your registered email</p>
        </div>

        <form className="otp-form" onSubmit={handleVerify}>
          {error && <div className="error-box">{error}</div>}
          {info && <div className="success-box">{info}</div>}

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
                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <button type="submit" className="verify-btn">
            Verify OTP
          </button>
        </form>

        <div className="resend">
          Didn't receive OTP?{" "}
          <span onClick={handleResend} role="button" tabIndex={0}>
            {isResending ? "Sending..." : "Resend"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
