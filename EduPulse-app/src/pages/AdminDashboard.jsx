import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
  LogOut,
  Menu,
} from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "../styles/adminDashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const AdminDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showSidebar &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showSidebar]);

  const feedbackData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [260, 90, 60],
        backgroundColor: ["#16a34a", "#facc15", "#dc2626"],
        borderWidth: 0,
      },
    ],
  };

  const departmentData = {
    labels: ["CSE", "IT", "ECE", "EEE"],
    datasets: [
      {
        data: [220, 180, 140, 100],
        backgroundColor: "#4f46e5",
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${showSidebar ? "show" : ""}`}
      >
        <div>
          <h2 className="logo">EduPulse</h2>
          <div className="admin-profile">
            <img
              src="/student-avatar.png"
              alt="Admin"
              className="admin-avatar"
            />
            <p className="admin-name">Admin</p>
          </div>
          <ul className="menu">
            <li className="active">Dashboard</li>
            <li>Students</li>
            <li>Feedback</li>
            <li>Reports</li>
          </ul>
        </div>

        {/* FIXED logout */}
        <button className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main */}
      <main className="main-content">
        <button
          className="menu-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu size={22} />
        </button>

        <h1 className="page-title">Admin Dashboard</h1>

        {/* Cards */}
        <div className="card-grid">
          <Card icon={<Users />} title="Total Students" value="520" color="blue" />
          <Card icon={<MessageSquare />} title="Total Feedback" value="410" color="violet" />
          <Card icon={<ThumbsUp />} title="Positive" value="260" color="green" />
          <Card icon={<Minus />} title="Neutral" value="90" color="yellow" />
          <Card icon={<ThumbsDown />} title="Negative" value="60" color="red" />
          <Card icon={<AlertCircle />} title="Not Submitted" value="110" color="orange" />
        </div>

        {/* Charts */}
        <div className="charts-grid">
          {/* FIXED donut */}
          <div className="chart-box donut-box">
            <h3>Feedback Distribution</h3>
            <div className="donut-wrapper">
              <Doughnut
                data={feedbackData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "70%",
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { boxWidth: 12 },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-box">
            <h3>Department Wise Submission</h3>
            <Bar
              data={departmentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const Card = ({ icon, title, value, color }) => (
  <div className="card">
    <div className={`card-icon ${color}`}>{icon}</div>
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

export default AdminDashboard;
