import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import "../styles/registerStudentID.css";

const RegisterStudentID = () => {
  const navigate = useNavigate();

  const handleSendOTP = (e) => {
    e.preventDefault();
    // dummy flow – backend later
    navigate("/verify-otp");
  };

  return (
    <div className="register-container">
      <div className="register-card">

        {/* Logo */}
        <div className="register-header">
          <img
            src="/EduPulse.png"
            alt="EduPulse Logo"
            className="register-logo"
          />
          <p className="tagline">
            Enter your Register Number to continue
          </p>
        </div>

        {/* Form */}
        <form className="register-form" onSubmit={handleSendOTP}>
          <label>Student ID / Register Number</label>

          <div className="input-wrapper">
            <GraduationCap className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter your register number"
              maxLength={12}
              pattern="[0-9]{12}"
              title="Register number must be exactly 12 digits"
              required
            />
          </div>

          <button type="submit" className="register-btn">
            Send OTP
          </button>
        </form>

        {/* Back to login */}
        <div className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterStudentID;
