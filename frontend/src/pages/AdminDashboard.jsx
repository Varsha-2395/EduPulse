import React from "react";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertCircle,
} from "lucide-react";

import AdminLayout from "../components/AdminLayout";
import { dashboardMetrics, highlightsData } from "../data/feedbackData";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
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
