import React from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
} from "lucide-react";

import AdminLayout from "../components/AdminLayout";
import { dashboardMetrics, highlightsData, monthlyTrendData } from "../data/feedbackData";
import "../styles/adminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const trendData = {
    labels: monthlyTrendData.map((item) => item.label),
    datasets: [
      {
        label: "Feedback Submissions",
        data: monthlyTrendData.map((item) => item.count),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.14)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 5,
        },
      },
    },
  };

  return (
    <AdminLayout>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="card-grid">
        <Card icon={<Users />} title="Total Students" value={dashboardMetrics.totalStudents} color="blue" />
        <Card icon={<MessageSquare />} title="Total Feedback" value={dashboardMetrics.totalFeedback} color="violet" />
        <Card icon={<ThumbsUp />} title="Positive" value={dashboardMetrics.positive} color="green" />
        <Card icon={<Minus />} title="Neutral" value={dashboardMetrics.neutral} color="yellow" />
        <Card icon={<ThumbsDown />} title="Negative" value={dashboardMetrics.negative} color="red" />
        <Card icon={<AlertCircle />} title="Not Submitted" value={dashboardMetrics.notSubmitted} color="orange" />
      </div>

      <div className="trend-section">
        <div className="trend-card">
          <h3>Monthly Feedback Trend</h3>
          <p>Track how many submissions were received month by month.</p>
          <div className="trend-chart-wrap">
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>
      </div>

      <div className="highlights-section">
        <h3>Class-wise Feedback Highlights</h3>

        <div className="highlight-grid">
          {highlightsData.map((item) => (
            <div key={item.id} className={`highlight-card ${item.type}`}>
              <p className="highlight-class">{item.class}</p>
              <p className="highlight-title">{item.title}</p>
              <p className="highlight-text">{item.text}</p>
            </div>
          ))}
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
