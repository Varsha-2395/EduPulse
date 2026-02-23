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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const [exportDepartment, setExportDepartment] = useState("All");
  const [exportYear, setExportYear] = useState("All");

  const filteredFeedbacks = useMemo(() => {
    return feedbackEntries.filter((fb) => {
      const matchDept =
        departmentFilter === "All" || fb.department === departmentFilter;
      const matchYear = yearFilter === "All" || fb.year === yearFilter;
      const matchFrom = !fromDate || new Date(fb.date) >= new Date(fromDate);
      const matchTo = !toDate || new Date(fb.date) <= new Date(toDate);
      return matchDept && matchYear && matchFrom && matchTo;
    });
  }, [departmentFilter, yearFilter, fromDate, toDate]);

  const chartFeedbacks = useMemo(() => {
    return filteredFeedbacks.filter((fb) => {
      if (ratingFilter === "All") return true;
      return fb.rating === ratingFilter;
    });
  }, [filteredFeedbacks, ratingFilter]);

  const ratingBreakdown = useMemo(() => {
    return chartFeedbacks.reduce(
      (acc, fb) => {
        const rating = fb.rating.toLowerCase();
        if (rating === "positive") acc.positive += 1;
        if (rating === "neutral") acc.neutral += 1;
        if (rating === "negative") acc.negative += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
  }, [chartFeedbacks]);

  const departmentBreakdown = useMemo(() => {
    return chartFeedbacks.reduce((acc, fb) => {
      acc[fb.department] = (acc[fb.department] || 0) + 1;
      return acc;
    }, {});
  }, [chartFeedbacks]);

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

  const handleExportPDF = () => {
    if (!exportFeedbacks.length) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const title = "EduPulse Feedback Report";
    const filterText = `Department: ${exportDepartment} | Year: ${exportYear}`;
    const countText = `Total Submissions: ${exportFeedbacks.length}`;

    doc.setFontSize(16);
    doc.text(title, 40, 40);
    doc.setFontSize(11);
    doc.text(filterText, 40, 62);
    doc.text(countText, 40, 78);

    autoTable(doc, {
      startY: 92,
      head: [["Date", "Student", "Department", "Year", "Rating", "Comment"]],
      body: exportFeedbacks.map((fb) => [
        fb.date,
        fb.student,
        fb.department,
        fb.year,
        fb.rating,
        fb.comment,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [79, 70, 229],
      },
      columnStyles: {
        5: { cellWidth: 260 },
      },
      margin: { left: 40, right: 40 },
    });

    doc.save(`feedback-report-${exportDepartment}-${exportYear}.pdf`);
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

        <div className="reports-toolbar">
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

            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              {["All", "Positive", "Neutral", "Negative"].map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Ratings" : option}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              aria-label="From date"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              aria-label="To date"
            />
          </div>
        </div>
        <span className="rating-filter-count">
          Filtered for charts: {chartFeedbacks.length}
        </span>

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
          <h3>Download Reports</h3>
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
      </div>
    </AdminLayout>
  );
};

export default Reports;
