import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/students.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportOverlay, setShowImportOverlay] = useState(false);
  const [importOverlayText, setImportOverlayText] = useState("");
  const [importOverlayType, setImportOverlayType] = useState("info");
  const fileInputRef = useRef(null);

  const studentsPerPage = 10;
  const cleanDisplayValue = (value) => {
    let cell = String(value || "").trim();
    if (!cell) return "";

    if (cell.startsWith("\"") && cell.endsWith("\"")) {
      cell = cell.slice(1, -1);
    }

    const excelTextMatch = cell.match(/^=\s*"(.+)"$/);
    if (excelTextMatch) {
      cell = excelTextMatch[1];
    }

    if (cell.startsWith("\"") && cell.endsWith("\"")) {
      cell = cell.slice(1, -1);
    }

    return cell;
  };
  const formatRegNo = (value) => {
    const raw = cleanDisplayValue(value);
    if (!raw) return "";

    if (!/^-?\d+(\.\d+)?e[+-]?\d+$/i.test(raw)) {
      return raw;
    }

    const [mantissaRaw, exponentRaw] = raw.toLowerCase().split("e");
    const exponent = parseInt(exponentRaw, 10);
    if (Number.isNaN(exponent)) return raw;

    const sign = mantissaRaw.startsWith("-") ? "-" : "";
    const mantissa = mantissaRaw.replace("-", "");
    const [intPart, fracPart = ""] = mantissa.split(".");
    const digits = `${intPart}${fracPart}`;
    const decimalIndex = intPart.length;
    const newIndex = decimalIndex + exponent;

    let expanded = "";
    if (newIndex <= 0) {
      expanded = `0.${"0".repeat(Math.abs(newIndex))}${digits}`;
    } else if (newIndex >= digits.length) {
      expanded = `${digits}${"0".repeat(newIndex - digits.length)}`;
    } else {
      expanded = `${digits.slice(0, newIndex)}.${digits.slice(newIndex)}`;
    }

    if (expanded.includes(".")) {
      expanded = expanded.replace(/\.?0+$/, "");
    }

    return `${sign}${expanded}`;
  };
  const canonicalRegNo = (value) =>
    formatRegNo(value).toLowerCase().replace(/\s+/g, "");

  const handleImportCSV = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  setIsImporting(true);
  setShowImportOverlay(true);
  setImportOverlayType("info");
  setImportOverlayText("Importing...");

  try {
    const res = await fetch("http://localhost:5000/api/students/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      const loaded = await fetchStudents();
      if (loaded) {
        setImportOverlayType("success");
        setImportOverlayText("Imported");
      } else {
        setImportOverlayType("error");
        setImportOverlayText("Import done, table refresh failed");
      }
      setTimeout(() => setShowImportOverlay(false), 1200);
    } else {
      setImportOverlayType("error");
      setImportOverlayText(data.message || "Import failed");
      setTimeout(() => setShowImportOverlay(false), 1500);
    }

  } catch (error) {
    console.log(error);
    setImportOverlayType("error");
    setImportOverlayText("Server error");
    setTimeout(() => setShowImportOverlay(false), 1500);
  } finally {
    setIsImporting(false);
    event.target.value = "";
  }
};

  /* ================= FETCH STUDENTS ================= */

  const fetchStudents = async () => {
    try {
      const query = new URLSearchParams({
        search,
        department: departmentFilter,
        year: yearFilter,
        page: currentPage,
        limit: studentsPerPage,
      });

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `http://localhost:5000/api/students?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        const unique = [];
        const seen = new Set();
        for (const student of data.students || []) {
          const key = canonicalRegNo(student.regNo) || String(student._id || "");
          if (seen.has(key)) continue;
          seen.add(key);
          unique.push(student);
        }

        setStudents(unique);
        setTotalPages(data.totalPages || 1);
        setTotalStudents(
          typeof data.totalStudents === "number"
            ? data.totalStudents
            : (typeof data.total === "number" ? data.total : unique.length)
        );
        return true;
      } else {
        console.log(data.message);
        return false;
      }
    } catch (error) {
      console.log("Fetch error:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, departmentFilter, yearFilter, currentPage]);

  /* ================= EXPORT CSV ================= */

  const handleExportCSV = () => {
    if (!students.length) return;

    const headers = "Name,Year,Department,Email,Phone,RegNo\n";
    const rows = students
      .map(
        (s) => {
          const regNo = formatRegNo(s.regNo);
          return `"${s.name}","${s.year}","${s.department}","${s.email}","${s.phone}","	${regNo}"`;
        }
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

  return (
    <AdminLayout>
      <div className="students-container">

        {/* Header */}
        <div className="students-header">
          <h1 className="page-title">Students</h1>

          <div className="students-summary">
            <span>Total Students</span>
            <div className="students-count">{totalStudents}</div>
          </div>
        </div>

        {/* Controls */}
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
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>

        {/* Actions */}
        <div className="students-actions">
          <button
            type="button"
            className="students-action-btn"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            {isImporting ? "Importing..." : "Import CSV"}
          </button>

          <button
            type="button"
            className="students-action-btn secondary"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            hidden
            onChange={handleImportCSV}
          />
        </div>

        {/* Table */}
        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Department</th>
                <th>Register No</th>
              </tr>
            </thead>

            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr
                    key={student._id}
                    className="student-row"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td>{cleanDisplayValue(student.name)}</td>
                    <td>{cleanDisplayValue(student.year)}</td>
                    <td>{cleanDisplayValue(student.department)}</td>
                    <td>{formatRegNo(student.regNo) || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="students-pagination">
            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        {selectedStudent && (
          <div
            className="student-modal-overlay"
            onClick={() => setSelectedStudent(null)}
          >
            <div
              className="student-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{cleanDisplayValue(selectedStudent.name)}</h2>
                <button onClick={() => setSelectedStudent(null)}>x</button>
              </div>

              <div className="student-profile">
                <p><strong>Register No:</strong> {formatRegNo(selectedStudent.regNo) || "N/A"}</p>
                <p><strong>Year:</strong> {cleanDisplayValue(selectedStudent.year)}</p>
                <p><strong>Department:</strong> {cleanDisplayValue(selectedStudent.department)}</p>
                <p><strong>Email:</strong> {cleanDisplayValue(selectedStudent.email)}</p>
                <p><strong>Phone:</strong> {cleanDisplayValue(selectedStudent.phone)}</p>
              </div>
            </div>
          </div>
        )}

        {showImportOverlay && (
          <div className="students-status-overlay">
            <div className={`students-status-card ${importOverlayType}`}>
              {importOverlayText}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Students;

