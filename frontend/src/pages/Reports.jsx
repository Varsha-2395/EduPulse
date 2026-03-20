import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Bar, Pie } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import "../styles/reports.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Reports = () => {
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [exportDepartment, setExportDepartment] = useState("All");
  const [exportYear, setExportYear] = useState("All");
  const [exportTotalRecords, setExportTotalRecords] = useState(0);

  const [sentimentStats, setSentimentStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const mapDepartmentLabel = (value) => {
    const source = String(value || "").toLowerCase();
    if (source.includes("computer science")) return "CSE";
    if (source.includes("information technology")) return "IT";
    if (source.includes("electronics and communication")) return "ECE";
    if (source.includes("electrical and electronics")) return "EEE";
    return value || "N/A";
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const query = new URLSearchParams({
        department: departmentFilter,
        year: yearFilter,
        fromDate,
        toDate,
        sentiment: ratingFilter,
      });

      const res = await fetch(
        `http://localhost:5000/api/reports?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSentimentStats(data.sentimentStats || []);
        setDepartmentStats(data.departmentStats || []);
        setTotalRecords(data.total || 0);
      }
    } catch (error) {
      console.log("Report fetch error:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [departmentFilter, yearFilter, fromDate, toDate, ratingFilter]);

  const fetchExportCount = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const query = new URLSearchParams({
        department: exportDepartment,
        year: exportYear,
      });

      const res = await fetch(
        `http://localhost:5000/api/reports?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setExportTotalRecords(data.total || 0);
      } else {
        setExportTotalRecords(0);
      }
    } catch (error) {
      console.log("Export count fetch error:", error);
      setExportTotalRecords(0);
    }
  };

  useEffect(() => {
    fetchExportCount();
  }, [exportDepartment, exportYear]);

  const sentimentCountByLabel = sentimentStats.reduce((acc, item) => {
    const key = String(item?._id || "").trim();
    acc[key] = item?.count || 0;
    return acc;
  }, {});

  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [
          sentimentCountByLabel.Positive || 0,
          sentimentCountByLabel.Neutral || 0,
          sentimentCountByLabel.Negative || 0,
        ],
        backgroundColor: ["#16a34a", "#ca8a04", "#dc2626"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: departmentStats.map((item) => mapDepartmentLabel(item._id)),
    datasets: [
      {
        label: "Submissions",
        data: departmentStats.map((item) => item.count),
        backgroundColor: "#4f46e5",
        borderRadius: 8,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const idx = items?.[0]?.dataIndex;
            if (idx === undefined) return "";
            return departmentStats[idx]?._id || "";
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const handleExport = (type) => {
    const query = new URLSearchParams({
      department: exportDepartment,
      year: exportYear,
    });

    window.open(
      `http://localhost:5000/api/reports/download-${type}?${query.toString()}`,
      "_blank"
    );
  };
  const handleOverallDownload = () => {
    const query = new URLSearchParams({
      department: departmentFilter,
      year: yearFilter,
      fromDate,
      toDate,
      sentiment: ratingFilter,
    });
    window.open(
      `http://localhost:5000/api/reports/download-overall-pdf?${query.toString()}`,
      "_blank"
    );
  };

  return (
    <AdminLayout>
      <div className="reports-container">
        <div className="reports-header">
          <div>
            <h1>Reports</h1>
            <p>Class-wise Feedback Reports</p>
          </div>
          <button className="overall-report-btn" onClick={handleOverallDownload}>
            Overall Reports Download (PDF)
          </button>
        </div>

        <div className="reports-toolbar">
          <div className="reports-filters">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="All">All Ratings</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <span className="rating-filter-count">
          Filtered for charts: {totalRecords}
        </span>

        <div className="reports-visuals">
          <div className="report-visual-grid">
            <div className="report-chart-card">
              <h3>Feedback Sentiment</h3>
              <div className="report-chart-wrap">
                {totalRecords > 0 ? (
                  <Pie data={pieData} options={pieOptions} />
                ) : (
                  <p className="no-data">No data to visualize</p>
                )}
              </div>
            </div>

            <div className="report-chart-card">
              <h3>Department-wise Submissions</h3>
              <div className="report-chart-wrap">
                {totalRecords > 0 ? (
                  <Bar data={barData} options={barOptions} />
                ) : (
                  <p className="no-data">No data to visualize</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="export-controls">
          <h3>Download Reports</h3>

          <div className="reports-filters export-filters">
            <select
              value={exportDepartment}
              onChange={(e) => setExportDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>

            <select
              value={exportYear}
              onChange={(e) => setExportYear(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <p className="export-count">
            Total Records: {exportTotalRecords}
          </p>

          <div className="reports-actions">
            <button
              className="primary-btn"
              onClick={() => handleExport("pdf")}
              disabled={!exportTotalRecords}
            >
              Download PDF
            </button>

            <button
              className="secondary-btn"
              onClick={() => handleExport("excel")}
              disabled={!exportTotalRecords}
            >
              Download Excel
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
