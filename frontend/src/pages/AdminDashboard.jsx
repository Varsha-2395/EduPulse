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
    AlertCircle,
    MessageSquare,
    Minus,
    ThumbsDown,
    ThumbsUp,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

import AdminLayout from "../components/AdminLayout";
import "../styles/adminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const getHighlightYearClass = (value = "") => {
  const normalized = String(value).toLowerCase();
  if (normalized.includes("1st year")) return "year-1";
  if (normalized.includes("2nd year")) return "year-2";
  if (normalized.includes("3rd year")) return "year-3";
  if (normalized.includes("4th year")) return "year-4";
  return "year-default";
};

const formatClassSummaryTitle = (item = {}) => {
  const year = String(item?.year || "").trim();
  const department = String(item?.department || "").trim();

  if (year && department) return `${year} - ${department}`;
  return String(item?.group || department || year || "Class Summary");
};

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalFeedback: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    notSubmitted: 0,
  });
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:5000/api/dashboard");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load dashboard");
        }

        setMetrics({
          totalStudents: data?.metrics?.totalStudents || 0,
          totalFeedback: data?.metrics?.totalFeedback || 0,
          positive: data?.metrics?.positive || 0,
          neutral: data?.metrics?.neutral || 0,
          negative: data?.metrics?.negative || 0,
          notSubmitted: data?.metrics?.notSubmitted || 0,
        });
        setMonthlyTrendData(Array.isArray(data?.monthlyTrend) ? data.monthlyTrend : []);
      } catch (err) {
        setError(err.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    const fetchSummaryOnLoad = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError("");
        const res = await fetch("http://localhost:5000/api/summary");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to generate summary");
        }

        setSummaries(Array.isArray(data?.summaries) ? data.summaries : []);
      } catch (err) {
        setSummaryError(err.message || "Unable to generate summary");
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchDashboard();
    fetchSummaryOnLoad();
  }, []);

  const trendData = useMemo(() => ({
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
  }), [monthlyTrendData]);

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
      {loading && <p>Loading dashboard...</p>}
      {error && <p>{error}</p>}

      <div className="card-grid">
        <Card icon={<Users />} title="Total Students" value={metrics.totalStudents} color="blue" />
        <Card icon={<MessageSquare />} title="Total Feedback" value={metrics.totalFeedback} color="violet" />
        <Card icon={<ThumbsUp />} title="Positive" value={metrics.positive} color="green" />
        <Card icon={<Minus />} title="Neutral" value={metrics.neutral} color="yellow" />
        <Card icon={<ThumbsDown />} title="Negative" value={metrics.negative} color="red" />
        <Card icon={<AlertCircle />} title="Not Submitted" value={metrics.notSubmitted} color="orange" />
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
        <h3>Class-wise Feedback Summary</h3>

        <div className="highlight-grid">
          {summaries.map((item, index) => (
            <div
              key={`${item.group}-${index}`}
              className={`highlight-card ${getHighlightYearClass(item.group)}`}
            >
              <p className="highlight-class">{formatClassSummaryTitle(item)}</p>
              <p className="highlight-text">{item.summary}</p>
            </div>
          ))}
          {summaryLoading && <p>Loading class-wise summary...</p>}
          {!summaryLoading && summaryError && <p className="summary-error">{summaryError}</p>}
          {!summaryLoading && !summaryError && summaries.length === 0 && !loading && (
            <p>No class-wise summary available.</p>
          )}
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
