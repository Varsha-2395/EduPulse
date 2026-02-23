import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { departmentOptions, feedbackEntries, yearOptions } from "../data/feedbackData";
import "../styles/feedbacks.css";

const Feedbacks = () => {
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const filteredFeedbacks = feedbackEntries.filter((fb) => {
    const deptMatch = department === "All" || fb.department === department;
    const yearMatch = year === "All" || fb.year === year;
    const fromMatch = !fromDate || new Date(fb.date) >= new Date(fromDate);
    const toMatch = !toDate || new Date(fb.date) <= new Date(toDate);

    return deptMatch && yearMatch && fromMatch && toMatch;
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
        </div>

        <div className="fbp-list">
          {pageItems.length > 0 ? (
            pageItems.map((fb) => (
              <article key={fb.id} className="fbp-card">
                <p className="fbp-date">{fb.date} | {fb.department} | {fb.year} | {fb.rating}</p>
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
