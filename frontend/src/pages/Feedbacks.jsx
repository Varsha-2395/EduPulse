import React, { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { departmentOptions, feedbackEntries, yearOptions } from "../data/feedbackData";
import "../styles/feedbacks.css";

const positiveKeywords = [
  "good",
  "great",
  "clear",
  "helpful",
  "interactive",
  "supportive",
  "useful",
  "easy",
  "well",
  "effective",
  "excellent",
];

const negativeKeywords = [
  "bad",
  "poor",
  "slow",
  "fast",
  "difficult",
  "hard",
  "problem",
  "issue",
  "confusing",
  "need",
  "more",
];

const detectSentimentFromKeywords = (text) => {
  const normalized = String(text).toLowerCase();
  const positiveScore = positiveKeywords.reduce(
    (score, word) => score + (normalized.includes(word) ? 1 : 0),
    0
  );
  const negativeScore = negativeKeywords.reduce(
    (score, word) => score + (normalized.includes(word) ? 1 : 0),
    0
  );

  if (positiveScore > negativeScore) return "Positive";
  if (negativeScore > positiveScore) return "Negative";
  return "Neutral";
};

const Feedbacks = () => {
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const feedbacksWithSentiment = useMemo(
    () =>
      feedbackEntries.map((fb) => ({
        ...fb,
        detectedSentiment: detectSentimentFromKeywords(fb.comment),
      })),
    []
  );

  const filteredFeedbacks = feedbacksWithSentiment.filter((fb) => {
    const deptMatch = department === "All" || fb.department === department;
    const yearMatch = year === "All" || fb.year === year;
    const fromMatch = !fromDate || new Date(fb.date) >= new Date(fromDate);
    const toMatch = !toDate || new Date(fb.date) <= new Date(toDate);
    const keywordMatch =
      !keyword ||
      fb.comment.toLowerCase().includes(keyword.toLowerCase()) ||
      fb.student.toLowerCase().includes(keyword.toLowerCase());
    const sentimentMatch =
      sentimentFilter === "All" || fb.detectedSentiment === sentimentFilter;

    return (
      deptMatch &&
      yearMatch &&
      fromMatch &&
      toMatch &&
      keywordMatch &&
      sentimentMatch
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageItems = filteredFeedbacks.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const onDepartmentChange = (value) => {
    setDepartment(value);
    setCurrentPage(1);
  };

  const onYearChange = (value) => {
    setYear(value);
    setCurrentPage(1);
  };

  const onFromDateChange = (value) => {
    setFromDate(value);
    setCurrentPage(1);
  };

  const onToDateChange = (value) => {
    setToDate(value);
    setCurrentPage(1);
  };

  const onKeywordChange = (value) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  const onSentimentChange = (value) => {
    setSentimentFilter(value);
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <section className="fbp-root">
        <header className="fbp-header">
          <h1 className="fbp-title">Feedbacks</h1>
          <div className="fbp-count-pill">{filteredFeedbacks.length} Feedbacks</div>
        </header>

        <div className="fbp-filter-bar">
          <div className="fbp-field">
            <label htmlFor="fbp-department">Department</label>
            <select
              id="fbp-department"
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
            >
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Departments" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="fbp-field">
            <label htmlFor="fbp-year">Year</label>
            <select
              id="fbp-year"
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All Years" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="fbp-field">
            <label htmlFor="fbp-from-date">From Date</label>
            <input
              id="fbp-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
            />
          </div>

          <div className="fbp-field">
            <label htmlFor="fbp-to-date">To Date</label>
            <input
              id="fbp-to-date"
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
            />
          </div>

          <div className="fbp-field">
            <label htmlFor="fbp-keyword">Sentiment Keyword</label>
            <input
              id="fbp-keyword"
              type="text"
              placeholder="e.g. good, need, clear..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
            />
          </div>

          <div className="fbp-field">
            <label htmlFor="fbp-sentiment">Detected Sentiment</label>
            <select
              id="fbp-sentiment"
              value={sentimentFilter}
              onChange={(e) => onSentimentChange(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
        </div>

        <div className="fbp-list">
          {pageItems.length > 0 ? (
            pageItems.map((fb) => (
              <article key={fb.id} className="fbp-card">
                <p className="fbp-date">{fb.date} | {fb.department} | {fb.year}</p>
                <p className={`fbp-detected ${fb.detectedSentiment.toLowerCase()}`}>
                  Detected: {fb.detectedSentiment}
                </p>
                <p className="fbp-comment">{fb.comment}</p>
              </article>
            ))
          ) : (
            <div className="fbp-empty">No feedback found for selected filters</div>
          )}
        </div>

        {filteredFeedbacks.length > 0 && (
          <footer className="fbp-pagination">
            <button
              type="button"
              className="fbp-page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
            >
              Prev
            </button>

            <span className="fbp-page-info">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="fbp-page-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
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
