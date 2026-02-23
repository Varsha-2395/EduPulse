import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { departmentOptions, studentsData, yearOptions } from "../data/feedbackData";
import "../styles/students.css";

const Students = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment =
      departmentFilter === "All" || student.department === departmentFilter;
    const matchesYear = yearFilter === "All" || student.year === yearFilter;

    return matchesSearch && matchesDepartment && matchesYear;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (safeCurrentPage - 1) * studentsPerPage,
    safeCurrentPage * studentsPerPage
  );

  return (
    <AdminLayout>
      <div className="students-container">
        <div className="students-header">
          <h1 className="page-title">Students</h1>

          <div className="students-summary">
            <span className="students-summary-label">Total Students</span>
            <div className="students-count">{filteredStudents.length}</div>
          </div>
        </div>

        <div className="students-controls">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {departmentOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Departments" : option}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Years" : option}
              </option>
            ))}
          </select>
        </div>

        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="student-row"
                    onClick={() => setSelectedStudent(student)}
                    onTouchStart={() => setSelectedStudent(student)}
                  >
                    <td data-label="Name">{student.name}</td>
                    <td data-label="Year">{student.year}</td>
                    <td data-label="Department">{student.department}</td>
                    <td data-label="Email">{student.email}</td>
                    <td data-label="Phone">{student.phone}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredStudents.length > 0 && (
          <div className="students-pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
            >
              Prev
            </button>

            <span className="pagination-info">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {selectedStudent && (
          <div
            className="student-modal-overlay"
            onClick={() => setSelectedStudent(null)}
          >
            <div className="student-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedStudent.name}</h2>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Close"
                >
                  x
                </button>
              </div>

              <div className="student-profile">
                <p><strong>Year:</strong> {selectedStudent.year}</p>
                <p><strong>Department:</strong> {selectedStudent.department}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Phone:</strong> {selectedStudent.phone}</p>
              </div>

              <div className="student-feedback">
                <h3>Feedback History</h3>
                {selectedStudent.feedbackHistory.map((entry, index) => (
                  <div key={`${selectedStudent.id}-${index}`} className="feedback-history-card">
                    <p className="feedback-date">
                      Submitted On: {entry.submittedOn} | Rating: {entry.rating}
                    </p>
                    <p className="feedback-comment">{entry.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Students;
