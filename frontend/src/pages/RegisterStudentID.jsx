import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import "../styles/registerStudentID.css";

const RegisterStudentID = () => {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSending(true);

    try {
      const res = await fetch("http://localhost:5000/api/students/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regNo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || "Failed to send OTP. Try again.");
        return;
      }

      setSuccessMessage("OTP sent successfully");

      setTimeout(() => {
        navigate("/verify-otp", { state: { otp: data.otp, regNo } });
      }, 1200);
    } catch {
      setError("Server error. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        <div className="register-header">
          <img src="/EduPulse.png" alt="EduPulse Logo" className="register-logo" />
          <p className="tagline">Enter your Register Number to continue</p>
        </div>

        <form className="register-form" onSubmit={handleSendOTP}>
          {error && <div className="register-alert register-alert-error">{error}</div>}

          <label>Student ID / Register Number</label>

          <div className="input-wrapper">
            <GraduationCap className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter your register number"
              maxLength={12}
              pattern="[0-9]{12}"
              required
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>

          <button type="submit" className="register-btn" disabled={isSending}>
            {isSending ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>

      </div>

      {successMessage && (
        <div className="success-popup-overlay">
          <div className="success-popup">{successMessage}</div>
        </div>
      )}
    </div>
  );
};

export default RegisterStudentID;
