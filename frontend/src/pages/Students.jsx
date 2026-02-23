import React, { useRef, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { departmentOptions, studentsData, yearOptions } from "../data/feedbackData";
import "../styles/students.css";

const Students = () => {
  const [students, setStudents] = useState(studentsData);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [csvMessage, setCsvMessage] = useState("");
  const fileInputRef = useRef(null);
  const studentsPerPage = 10;

  const filteredStudents = students.filter((student) => {
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

  const parseCSVLine = (line) => {
    const result = [];
    let value = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          value += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(value.trim());
        value = "";
      } else {
        value += char;
      }
    }

    result.push(value.trim());
    return result;
  };

  const handleExportCSV = () => {
    if (!filteredStudents.length) return;

    const headers = "Name,Year,Department,Email,Phone,Feedback\n";
    const escapeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = filteredStudents
      .map((student) =>
        [
          student.name,
          student.year,
          student.department,
          student.email,
          student.phone,
          student.feedbackHistory?.[0]?.comment || "",
        ]
          .map(escapeCSV)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean);

    if (rows.length < 2) {
      setCsvMessage("CSV is empty or missing data rows.");
      event.target.value = "";
      return;
    }

    const header = parseCSVLine(rows[0]).map((col) => col.toLowerCase());
    const getIdx = (name) => header.indexOf(name);

    const nameIdx = getIdx("name");
    const yearIdx = getIdx("year");
    const deptIdx = getIdx("department");
    const emailIdx = getIdx("email");
    const phoneIdx = getIdx("phone");
    const feedbackIdx = header.includes("feedback")
      ? getIdx("feedback")
      : getIdx("comment");

    if ([nameIdx, yearIdx, deptIdx, emailIdx, phoneIdx].some((idx) => idx === -1)) {
      setCsvMessage("Required columns: name, year, department, email, phone.");
      event.target.value = "";
      return;
    }

    const baseId = students.length ? Math.max(...students.map((s) => Number(s.id) || 0)) : 0;
    let importedCount = 0;
    let skippedCount = 0;

    const importedStudents = rows.slice(1).reduce((acc, row, index) => {
      const cols = parseCSVLine(row);
      const name = cols[nameIdx];
      const year = cols[yearIdx];
      const department = cols[deptIdx];
      const email = cols[emailIdx];
      const phone = cols[phoneIdx];
      const feedback = feedbackIdx >= 0 ? cols[feedbackIdx] : "";

      if (!name || !year || !department || !email || !phone) {
        skippedCount += 1;
        return acc;
      }

      importedCount += 1;
      acc.push({
        id: baseId + index + 1,
        name,
        year,
        department,
        email,
        phone,
        feedbackHistory: [
          {
            submittedOn: new Date().toISOString().slice(0, 10),
            rating: "Neutral",
            comment: feedback || "Imported via CSV",
          },
        ],
      });

      return acc;
    }, []);

    if (importedStudents.length) {
      setStudents((prev) => [...prev, ...importedStudents]);
      setCurrentPage(1);
    }

    setCsvMessage(
      `Imported ${importedCount} student(s)${skippedCount ? `, skipped ${skippedCount} row(s).` : "."}`
    );
    event.target.value = "";
  };

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

        <div className="students-actions">
          <button
            type="button"
            className="students-action-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Import CSV
          </button>
          <button
            type="button"
            className="students-action-btn secondary"
            onClick={handleExportCSV}
            disabled={!filteredStudents.length}
          >
            Export CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportCSV}
            hidden
          />
        </div>

        {csvMessage ? <p className="students-import-note">{csvMessage}</p> : null}

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
