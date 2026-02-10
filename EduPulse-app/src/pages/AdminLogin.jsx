import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/adminLogin.css";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!adminId || !password) {
      setError("Please enter Admin ID and Password");
      return;
    }

    if (!/^\d{12}$/.test(adminId)) {
      setError("Admin ID must be exactly 12 digits");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must contain uppercase, lowercase, number & special character"
      );
      return;
    }

    setError("");
    // Dummy success – backend later
    navigate("/admin-dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <img src="/EduPulse.png" alt="EduPulse Logo" className="login-logo" />
          <p className="tagline">Admin Panel Login</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-box">{error}</div>}

          <label>Admin ID</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter your admin ID"
              value={adminId}
              maxLength={12}
              pattern="[0-9]{12}"
              onChange={(e) => setAdminId(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </form>

        <div className="admin-link">
          Back to student login? <Link to="/">Click here</Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
