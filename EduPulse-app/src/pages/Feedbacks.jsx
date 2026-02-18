import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/feedbacks.css";

const Feedbacks = () => {
  const feedbackData = [
    { id: 1, department: "CSE", year: "1st Year", date: "2026-01-03", comment: "Faculty explains each topic clearly with good real-time examples." },
    { id: 2, department: "IT", year: "2nd Year", date: "2026-01-06", comment: "Need a little more revision time before weekly tests." },
    { id: 3, department: "ECE", year: "3rd Year", date: "2026-01-09", comment: "Class interaction is very good and doubts are addressed quickly." },
    { id: 4, department: "EEE", year: "4th Year", date: "2026-01-12", comment: "Practical sessions are useful and improve confidence in coding." },
    { id: 5, department: "CSE", year: "2nd Year", date: "2026-01-15", comment: "Teaching pace is balanced and easy to follow for all students." },
    { id: 6, department: "IT", year: "3rd Year", date: "2026-01-18", comment: "More case-study based discussion would make classes even better." },
    { id: 7, department: "ECE", year: "4th Year", date: "2026-01-21", comment: "Department support is strong and feedback is taken seriously." },
    { id: 8, department: "EEE", year: "1st Year", date: "2026-01-24", comment: "Assignments are relevant and improve understanding of concepts." },
    { id: 9, department: "CSE", year: "3rd Year", date: "2026-01-27", comment: "Lab infrastructure is good and sessions are well organized." },
    { id: 10, department: "IT", year: "4th Year", date: "2026-01-30", comment: "Overall the subject delivery is clear and student friendly." },
    { id: 11, department: "ECE", year: "1st Year", date: "2026-02-02", comment: "Faculty guidance for mini projects is practical and helpful." },
    { id: 12, department: "EEE", year: "2nd Year", date: "2026-02-05", comment: "More peer-learning activities would be useful for collaboration." },
    { id: 13, department: "CSE", year: "4th Year", date: "2026-02-08", comment: "Internal tests are helpful and questions match class coverage." },
    { id: 14, department: "IT", year: "1st Year", date: "2026-02-10", comment: "Faculty is approachable and clarifies doubts patiently." },
    { id: 15, department: "ECE", year: "2nd Year", date: "2026-02-12", comment: "Need more time for practical sessions in the laboratory." },
    { id: 16, department: "EEE", year: "3rd Year", date: "2026-02-14", comment: "Class discipline is good and sessions start on time." },
    { id: 17, department: "CSE", year: "1st Year", date: "2026-02-16", comment: "The way complex topics are broken down is very helpful." },
    { id: 18, department: "IT", year: "2nd Year", date: "2026-02-18", comment: "Notes and slides are easy to understand and revise." },
    { id: 19, department: "ECE", year: "3rd Year", date: "2026-02-20", comment: "Would like more discussion on previous year question papers." },
    { id: 20, department: "EEE", year: "4th Year", date: "2026-02-22", comment: "Overall teaching quality is consistent and effective." },
    { id: 21, department: "CSE", year: "2nd Year", date: "2026-02-24", comment: "Project guidance is practical and aligned with industry needs." },
    { id: 22, department: "IT", year: "3rd Year", date: "2026-02-25", comment: "Weekly evaluations help us stay prepared." },
    { id: 23, department: "ECE", year: "4th Year", date: "2026-02-26", comment: "Teaching style is interactive and keeps students engaged." },
    { id: 24, department: "EEE", year: "1st Year", date: "2026-02-27", comment: "Need a bit more recap time at the end of each class." },
  ];

  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const filteredFeedbacks = feedbackData.filter((fb) => {
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
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          <div className="fbp-field">
            <label htmlFor="fbp-year">Year</label>
            <select
              id="fbp-year"
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
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
                <p className="fbp-date">{fb.date}</p>
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
