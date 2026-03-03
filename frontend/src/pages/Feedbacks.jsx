import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/feedbacks.css";

const Feedbacks = () => {
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("All");

  const [feedbacks, setFeedbacks] = useState([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const formatDateTime = (value) => {
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return "Invalid date";

    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return `${date} ${time}`;
  };

  /* ================= FETCH FROM BACKEND ================= */

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const query = new URLSearchParams({
        department,
        year,
        fromDate,
        toDate,
        keyword,
        sentiment: sentimentFilter,
        page: currentPage,
        limit: itemsPerPage,
      });

      const res = await fetch(
        `http://localhost:5000/api/feedback/admin?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setFeedbacks(data.feedbacks || []);
        setTotalFeedbacks(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [department, year, fromDate, toDate, keyword, sentimentFilter, currentPage]);

  /* ================= RESET PAGE WHEN FILTER CHANGES ================= */

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <section className="fbp-root">
        <header className="fbp-header">
          <h1 className="fbp-title">Feedbacks</h1>
          <div className="fbp-count-pill">
            {totalFeedbacks} Feedbacks
          </div>
        </header>

        {/* ================= FILTER BAR ================= */}

        <div className="fbp-filter-bar">

          <div className="fbp-field">
            <label>Department</label>
            <select
              value={department}
              onChange={(e) => handleFilterChange(setDepartment)(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          <div className="fbp-field">
            <label>Year</label>
            <select
              value={year}
              onChange={(e) => handleFilterChange(setYear)(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div className="fbp-field">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFilterChange(setFromDate)(e.target.value)}
            />
          </div>

          <div className="fbp-field">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleFilterChange(setToDate)(e.target.value)}
            />
          </div>

          <div className="fbp-field">
            <label>Sentiment Keyword</label>
            <input
              type="text"
              placeholder="e.g. good, need..."
              value={keyword}
              onChange={(e) => handleFilterChange(setKeyword)(e.target.value)}
            />
          </div>

          <div className="fbp-field">
            <label>Detected Sentiment</label>
            <select
              value={sentimentFilter}
              onChange={(e) =>
                handleFilterChange(setSentimentFilter)(e.target.value)
              }
            >
              <option value="All">All</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
        </div>

        {/* ================= FEEDBACK LIST ================= */}

        <div className="fbp-list">
          {feedbacks.length > 0 ? (
            feedbacks.map((fb) => (
              <article key={fb._id} className="fbp-card">
                <p className="fbp-date">
                  {formatDateTime(fb.createdAt)}
                </p>

                <p className={`fbp-detected ${fb.sentiment?.toLowerCase()}`}>
                  Detected: {fb.sentiment}
                </p>

                <p className="fbp-comment">{fb.comments}</p>
              </article>
            ))
          ) : (
            <div className="fbp-empty">
              No feedback found for selected filters
            </div>
          )}
        </div>

        {/* ================= PAGINATION ================= */}

        {totalPages > 1 && (
          <footer className="fbp-pagination">
            <button
              type="button"
              className="fbp-page-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <span className="fbp-page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="fbp-page-btn"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </footer>
        )}
      </section>
    </AdminLayout>
  );
};

export default Feedbacks;
