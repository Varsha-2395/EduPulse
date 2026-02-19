import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/reports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Reports = () => {
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");

  /* Dummy aggregated data 😌 */
  const feedbackStats = {
    total: 410,
    positive: 260,
    neutral: 90,
    negative: 60,
  };

  const departmentChartData = {
    labels: ["CSE", "IT", "ECE", "EEE"],
    datasets: [
      {
        label: "Feedback",
        data: [120, 100, 110, 80],
        backgroundColor: "#4f46e5",
        borderRadius: 8,
      },
    ],
  };

  const ratingChartData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [260, 90, 60],
        backgroundColor: ["#16a34a", "#facc15", "#dc2626"],
        borderWidth: 0,
      },
    ],
  };

  /* Export handlers 😎🔥 */
  const handleExportPDF = () => {
    window.print(); // simple & effective 😌
  };

  const handleExportCSV = () => {
    const csvContent = `
Category,Count
Positive,${feedbackStats.positive}
Neutral,${feedbackStats.neutral}
Negative,${feedbackStats.negative}
`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  };

  return (
    <AdminLayout>
      <div className="reports-container">
        <h1 className="page-title">Reports</h1>

        {/* Filters */}
        <div className="reports-filters">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="All">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>

        {/* Insight Cards */}
        <div className="reports-cards">
          <div className="report-card">
            <span>Total Feedback</span>
            <h2>{feedbackStats.total}</h2>
          </div>

          <div className="report-card positive">
            <span>Positive</span>
            <h2>{feedbackStats.positive}</h2>
          </div>

          <div className="report-card neutral">
            <span>Neutral</span>
            <h2>{feedbackStats.neutral}</h2>
          </div>

          <div className="report-card negative">
            <span>Negative</span>
            <h2>{feedbackStats.negative}</h2>
          </div>
        </div>

        {/* Charts */}
        <div className="reports-charts">
          <div className="chart-box">
            <h3>Department Wise Feedback</h3>
            <Bar
              data={departmentChartData}
              options={{ responsive: true }}
            />
          </div>

          <div className="chart-box">
            <h3>Rating Distribution</h3>
            <Doughnut
              data={ratingChartData}
              options={{
                cutout: "70%",
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>

        {/* Export Buttons 🔥 */}
        <div className="reports-actions">
          <button onClick={handleExportPDF}>
            Export PDF
          </button>

          <button onClick={handleExportCSV}>
            Export CSV
          </button>

          <button onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
