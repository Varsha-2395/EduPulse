import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/studentLogin.css";

const StudentLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [registerNo, setRegisterNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validatePassword = (value) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must include at least one uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must include at least one lowercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must include at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Password must include at least one special character";
    }

    return "";
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!registerNo || !password) {
      setError("Please enter register number and password");
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    setError("");
    // dummy success – backend later
    navigate("/student-dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <div className="login-header">
          <img
            src="/EduPulse.png"
            alt="EduPulse Logo"
            className="login-logo"
          />
          <p className="tagline">Feedback Made Simple</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>

          {/* Error message */}
          {error && <div className="error-box">{error}</div>}

          <label>Student ID / Register Number</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter your register number"
              maxLength={12}
              pattern="[0-9]{12}"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              minLength={8}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <div className="form-links">
            <span className="forgot">Forgot Password?</span>
          </div>

          <div className="register-link">
            New here? <Link to="/register">Register Now</Link>
          </div>
        </form>

        {/* Admin link */}
        <div className="admin-link">
          Are you an admin? <Link to="/admin-login">Login here</Link>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;
