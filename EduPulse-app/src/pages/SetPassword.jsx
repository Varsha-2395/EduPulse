import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import "../styles/setPassword.css";

const SetPassword = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    // dummy submit – backend later
    navigate("/login");
  };

  return (
    <div className="setpwd-container">
      <div className="setpwd-card">

        {/* Header */}
        <div className="setpwd-header">
          <img
            src="/EduPulse.png"
            alt="EduPulse Logo"
            className="setpwd-logo"
          />
          <p className="tagline">Set a secure password</p>
        </div>

        {/* Form */}
        <form className="setpwd-form" onSubmit={handleSubmit}>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <label>New Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              pattern="^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$"
              title="Password must be at least 8 characters, include one uppercase letter, one number and one special character"
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <label>Confirm Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button type="submit" className="setpwd-btn">
            Set Password
          </button>
        </form>

      </div>
    </div>
  );
};

export default SetPassword;
