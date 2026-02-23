import React, { useMemo, useState } from "react";
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
import { departmentOptions, feedbackEntries, yearOptions } from "../data/feedbackData";
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

  const [exportDepartment, setExportDepartment] = useState("All");
  const [exportYear, setExportYear] = useState("All");

  const filteredFeedbacks = useMemo(() => {
    return feedbackEntries.filter((fb) => {
      const matchDept =
        departmentFilter === "All" || fb.department === departmentFilter;
      const matchYear = yearFilter === "All" || fb.year === yearFilter;
      return matchDept && matchYear;
    });
  }, [departmentFilter, yearFilter]);

  const ratingBreakdown = useMemo(() => {
    return filteredFeedbacks.reduce(
      (acc, fb) => {
        const rating = fb.rating.toLowerCase();
        if (rating === "positive") acc.positive += 1;
        if (rating === "neutral") acc.neutral += 1;
        if (rating === "negative") acc.negative += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
  }, [filteredFeedbacks]);

  const departmentBreakdown = useMemo(() => {
    return filteredFeedbacks.reduce((acc, fb) => {
      acc[fb.department] = (acc[fb.department] || 0) + 1;
      return acc;
    }, {});
  }, [filteredFeedbacks]);

  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [
          ratingBreakdown.positive,
          ratingBreakdown.neutral,
          ratingBreakdown.negative,
        ],
        backgroundColor: ["#16a34a", "#ca8a04", "#dc2626"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const barData = {
    labels: Object.keys(departmentBreakdown),
    datasets: [
      {
        label: "Submissions",
        data: Object.values(departmentBreakdown),
        backgroundColor: "#4f46e5",
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
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
          stepSize: 1,
        },
      },
    },
  };

  const exportFeedbacks = useMemo(() => {
    return feedbackEntries.filter((fb) => {
      const matchDept =
        exportDepartment === "All" || fb.department === exportDepartment;
      const matchYear = exportYear === "All" || fb.year === exportYear;
      return matchDept && matchYear;
    });
  }, [exportDepartment, exportYear]);

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const handleExportPDF = () => {
    if (!exportFeedbacks.length) return;

    const reportRows = exportFeedbacks
      .map(
        (fb) => `
          <tr>
            <td>${escapeHtml(fb.date)}</td>
            <td>${escapeHtml(fb.student)}</td>
            <td>${escapeHtml(fb.department)}</td>
            <td>${escapeHtml(fb.year)}</td>
            <td>${escapeHtml(fb.rating)}</td>
            <td>${escapeHtml(fb.comment)}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Feedback Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 8px; }
            p { margin: 0 0 12px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #eef2ff; color: #312e81; }
          </style>
        </head>
        <body>
          <h1>EduPulse Feedback Report</h1>
          <p>Department: ${escapeHtml(exportDepartment)} | Year: ${escapeHtml(exportYear)}</p>
          <p>Total Submissions: ${exportFeedbacks.length}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Department</th>
                <th>Year</th>
                <th>Rating</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>${reportRows}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportExcel = () => {
    if (!exportFeedbacks.length) return;

    const headers = "Student,Department,Year,Rating,Comment,Date\n";

    const rows = exportFeedbacks
      .map(
        (fb) =>
          `${fb.student},${fb.department},${fb.year},${fb.rating},${fb.comment},${fb.date}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `feedback-report-${exportDepartment}-${exportYear}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="reports-container">
        <div className="reports-header">
          <h1>Reports</h1>
          <p>Class-wise Feedback Reports</p>
        </div>

        <div className="reports-filters">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departmentOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Departments" : option}
              </option>
            ))}
          </select>

          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Years" : option}
              </option>
            ))}
          </select>
        </div>

        <div className="reports-visuals">
          <div className="report-visual-grid">
            <div className="report-chart-card">
              <h3>Feedback Sentiment</h3>
              <div className="report-chart-wrap">
                {filteredFeedbacks.length > 0 ? (
                  <Pie data={pieData} options={pieOptions} />
                ) : (
                  <p className="no-data">No data to visualize</p>
                )}
              </div>
            </div>

            <div className="report-chart-card">
              <h3>Department-wise Submissions</h3>
              <div className="report-chart-wrap">
                {filteredFeedbacks.length > 0 ? (
                  <Bar data={barData} options={barOptions} />
                ) : (
                  <p className="no-data">No data to visualize</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="export-controls">
          <h3>Download Filters</h3>
          <div className="reports-filters">
            <select
              value={exportDepartment}
              onChange={(e) => setExportDepartment(e.target.value)}
            >
              {departmentOptions.map((option) => (
                <option key={`export-${option}`} value={option}>
                  {option === "All" ? "All Departments" : option}
                </option>
              ))}
            </select>

            <select value={exportYear} onChange={(e) => setExportYear(e.target.value)}>
              {yearOptions.map((option) => (
                <option key={`export-${option}`} value={option}>
                  {option === "All" ? "All Years" : option}
                </option>
              ))}
            </select>
          </div>
          <p className="export-count">Selected Records: {exportFeedbacks.length}</p>
        </div>

        <div className="reports-actions">
          <button
            className="primary-btn"
            onClick={handleExportPDF}
            disabled={!exportFeedbacks.length}
          >
            Download PDF
          </button>

          <button
            className="secondary-btn"
            onClick={handleExportExcel}
            disabled={!exportFeedbacks.length}
          >
            Download Excel
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
