import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/adminLogin.css";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailInput = String(formData.get("adminEmail") || adminEmail || "").trim().toLowerCase();
    const passwordInput = String(formData.get("password") || password || "");

    if (!emailInput || !passwordInput) {
      setError("Please enter Admin Email and Password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput,
          username: emailInput,
          identifier: emailInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Login failed");
      }

    } catch (err) {
      console.log(err);
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <img src="/EduPulse.png" alt="EduPulse Logo" className="login-logo" />
          <p className="tagline">Admin Panel Login</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-box">{error}</div>}

          <label>Admin Email</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Enter your admin email"
              value={adminEmail}
              name="adminEmail"
              autoComplete="username"
              onChange={(e) => setAdminEmail(e.target.value)}
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
              name="password"
              autoComplete="current-password"
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
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
