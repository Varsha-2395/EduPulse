import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, FileText, LogOut } from "lucide-react";
import "../styles/studentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const student = JSON.parse(localStorage.getItem("student"));

  if (!student) {
    navigate("/login"); // safety check 😏
    return null;
  }

  return (
    <div className="dash-container">
      {/* ===== Header ===== */}
      <div className="dash-header">
        <img
          src="/EduPulse.png"
          alt="EduPulse Logo"
          className="dash-logo"
        />

        <button
          className="logout-btn-top"
          onClick={() => {
            localStorage.removeItem("student");
            navigate("/login");
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* ===== Content Wrapper ===== */}
      <div className="dashboard-content">
        {/* ===== Student Card (Full Width Header) ===== */}
        <div className="welcome-card">
          <img
            src="/student-avatar.png"
            alt="Student Avatar"
            className="student-avatar"
          />

          <div className="student-info">
            <h2>Welcome, {student.name} 👋</h2>
            <p className="dept">{student.department}</p>
            <p className="year">{student.year}</p>
            <span className="reg-no">
              Reg No: {student.regNo}
            </span>
          </div>
        </div>

        {/* ===== Action Cards (Grid Items) ===== */}
        <div
          className="action-card feedback-card"
          onClick={() => navigate("/feedback")}
        >
          <MessageSquare size={40} strokeWidth={1.5} />
          <h3>Give Feedback</h3>
          <p>Share your feedback for the current semester</p>
        </div>

        <div
          className="action-card myfeedback-card"
          onClick={() => navigate("/my-feedback")}
        >
          <FileText size={40} strokeWidth={1.5} />
          <h3>My Feedback</h3>
          <p>View and track your previously submitted feedback</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;