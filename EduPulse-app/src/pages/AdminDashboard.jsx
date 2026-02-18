import React from "react";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
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

import AdminLayout from "../components/AdminLayout";
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
  const feedbackData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [260, 90, 60],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
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
        borderRadius: 10,
      },
    ],
  };

  return (
    <AdminLayout>
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
        <div className="chart-box donut-box">
          <h3>Feedback Distribution</h3>

          <div className="donut-wrapper">
            <Doughnut
              data={feedbackData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "72%",
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
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </div>
    </AdminLayout>
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
