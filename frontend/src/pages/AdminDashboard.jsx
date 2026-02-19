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
import "../styles/adminDashboard.css";

const AdminDashboard = () => {

  /* ✅ Class-wise Highlights Data */
  const highlightsData = [
    {
      id: 1,
      class: "1st Year - CSE",
      type: "negative",
      title: "Frequent Complaint",
      text: "Teaching pace is too fast",
    },
    {
      id: 2,
      class: "2nd Year - IT",
      type: "neutral",
      title: "Common Feedback",
      text: "Need more practical examples",
    },
    {
      id: 3,
      class: "3rd Year - ECE",
      type: "positive",
      title: "Frequent Praise",
      text: "Very good lab sessions",
    },
    {
      id: 4,
      class: "4th Year - EEE",
      type: "positive",
      title: "Frequent Praise",
      text: "Faculty explanation clarity",
    },
  ];

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

      {/* ✅ Highlights Section */}
      <div className="highlights-section">
        <h3>Class-wise Feedback Highlights</h3>

        <div className="highlight-grid">
          {highlightsData.map((item) => (
            <div
              key={item.id}
              className={`highlight-card ${item.type}`}
            >
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
