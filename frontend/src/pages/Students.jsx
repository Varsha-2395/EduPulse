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
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [addStudentError, setAddStudentError] = useState("");
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [editStudentError, setEditStudentError] = useState("");
  const [editableStudent, setEditableStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    year: "1st Year",
    department: "Computer Science and Engineering",
    email: "",
    phone: "",
    regNo: "",
  });
  const fileInputRef = useRef(null);

  const studentsPerPage = 10;
  const toUiMessage = (payload, fallbackMessage) => {
    if (!payload) return fallbackMessage;

    if (typeof payload === "string") return payload;

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }

    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }

    if (Array.isArray(payload.errors) && payload.errors.length) {
      return payload.errors
        .map((item) => item?.message || item?.msg || "")
        .filter(Boolean)
        .join(", ") || fallbackMessage;
    }

    if (payload.error && typeof payload.error === "object") {
      if (typeof payload.error.message === "string" && payload.error.message.trim()) {
        return payload.error.message;
      }
    }

    return fallbackMessage;
  };
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

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setEditableStudent({
      name: String(student?.name || ""),
      year: String(student?.year || "1st Year"),
      department: String(student?.department || "Computer Science and Engineering"),
      email: String(student?.email || ""),
      phone: String(student?.phone || ""),
      regNo: String(student?.regNo || ""),
    });
    setIsEditingStudent(false);
    setEditStudentError("");
  };

  const closeStudentModal = () => {
    if (isSavingStudent) return;
    setSelectedStudent(null);
    setEditableStudent(null);
    setIsEditingStudent(false);
    setEditStudentError("");
  };

  const handleEditStudentChange = (event) => {
    const { name, value } = event.target;
    setEditableStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveStudent = async (event) => {
    event.preventDefault();

    if (!selectedStudent?._id || !editableStudent) return;

    const payload = {
      name: String(editableStudent.name || "").trim(),
      year: String(editableStudent.year || "").trim(),
      department: String(editableStudent.department || "").trim(),
      email: String(editableStudent.email || "").trim().toLowerCase(),
      phone: String(editableStudent.phone || "").trim(),
      regNo: String(editableStudent.regNo || "").trim(),
    };

    if (!payload.name || !payload.regNo) {
      setEditStudentError("Name and Register No are required.");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setEditStudentError("Admin session expired. Please login again.");
      return;
    }

    setIsSavingStudent(true);
    setEditStudentError("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/students/${selectedStudent._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setEditStudentError(toUiMessage(data, "Unable to update student."));
        return;
      }

      setSelectedStudent(data);
      setEditableStudent({
        name: String(data?.name || ""),
        year: String(data?.year || "1st Year"),
        department: String(data?.department || "Computer Science and Engineering"),
        email: String(data?.email || ""),
        phone: String(data?.phone || ""),
        regNo: String(data?.regNo || ""),
      });
      setIsEditingStudent(false);
      await fetchStudents();

      setShowImportOverlay(true);
      setImportOverlayType("success");
      setImportOverlayText("Student updated successfully");
      setTimeout(() => setShowImportOverlay(false), 1200);
    } catch (error) {
      console.log(error);
      setEditStudentError("Server error. Try again.");
    } finally {
      setIsSavingStudent(false);
    }
  };

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
      setImportOverlayText(toUiMessage(data, "Import failed"));
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

  const handleAddStudentChange = (event) => {
    const { name, value } = event.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const resetAddStudentForm = () => {
    setNewStudent({
      name: "",
      year: "1st Year",
      department: "Computer Science and Engineering",
      email: "",
      phone: "",
      regNo: "",
    });
    setAddStudentError("");
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();

    const payload = {
      ...newStudent,
      name: String(newStudent.name || "").trim(),
      year: String(newStudent.year || "").trim(),
      department: String(newStudent.department || "").trim(),
      email: String(newStudent.email || "").trim().toLowerCase(),
      phone: String(newStudent.phone || "").trim(),
      regNo: String(newStudent.regNo || "").trim(),
    };

    if (!payload.name || !payload.regNo) {
      setAddStudentError("Name and Register No are required.");
      return;
    }

    setIsAddingStudent(true);
    setAddStudentError("");

    try {
      const res = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddStudentError(toUiMessage(data, "Unable to add student."));
        return;
      }

      setShowAddStudentModal(false);
      resetAddStudentForm();
      setCurrentPage(1);
      await fetchStudents();

      setShowImportOverlay(true);
      setImportOverlayType("success");
      setImportOverlayText("Student added successfully");
      setTimeout(() => setShowImportOverlay(false), 1200);
    } catch (error) {
      console.log(error);
      setAddStudentError("Server error. Try again.");
    } finally {
      setIsAddingStudent(false);
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
        console.log(toUiMessage(data, "Failed to fetch students"));
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
            <option value="CSE">Computer Science and Engineering</option>
            <option value="IT">Information Technology</option>
            <option value="ECE">Electronics and Communication Engineering</option>
            <option value="EEE">Electrical and Electronics Engineering</option>
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
            onClick={() => {
              resetAddStudentForm();
              setShowAddStudentModal(true);
            }}
          >
            Add Student
          </button>

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
                    onClick={() => openStudentModal(student)}
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
            onClick={closeStudentModal}
          >
            <div
              className="student-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{cleanDisplayValue(selectedStudent.name)}</h2>
                <button onClick={closeStudentModal}>x</button>
              </div>

              {!isEditingStudent ? (
                <>
                  <div className="student-profile">
                    <p><strong>Register No:</strong> {formatRegNo(selectedStudent.regNo) || "N/A"}</p>
                    <p><strong>Year:</strong> {cleanDisplayValue(selectedStudent.year)}</p>
                    <p><strong>Department:</strong> {cleanDisplayValue(selectedStudent.department)}</p>
                    <p><strong>Email:</strong> {cleanDisplayValue(selectedStudent.email)}</p>
                    <p><strong>Phone:</strong> {cleanDisplayValue(selectedStudent.phone)}</p>
                  </div>

                  <div className="add-student-actions">
                    <button
                      type="button"
                      className="students-action-btn"
                      onClick={() => {
                        setIsEditingStudent(true);
                        setEditStudentError("");
                      }}
                    >
                      Edit Student
                    </button>
                  </div>
                </>
              ) : (
                <form className="add-student-form" onSubmit={handleSaveStudent}>
                  <label>
                    Name
                    <input
                      type="text"
                      name="name"
                      value={editableStudent?.name || ""}
                      onChange={handleEditStudentChange}
                      required
                    />
                  </label>

                  <label>
                    Register No
                    <input
                      type="text"
                      name="regNo"
                      value={editableStudent?.regNo || ""}
                      onChange={handleEditStudentChange}
                      required
                    />
                  </label>

                  <label>
                    Year
                    <select
                      name="year"
                      value={editableStudent?.year || "1st Year"}
                      onChange={handleEditStudentChange}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </label>

                  <label>
                    Department
                    <select
                      name="department"
                      value={editableStudent?.department || "Computer Science and Engineering"}
                      onChange={handleEditStudentChange}
                    >
                      <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                      <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                    </select>
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={editableStudent?.email || ""}
                      onChange={handleEditStudentChange}
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      type="text"
                      name="phone"
                      value={editableStudent?.phone || ""}
                      onChange={handleEditStudentChange}
                    />
                  </label>

                  {editStudentError && (
                    <p className="add-student-error">{editStudentError}</p>
                  )}

                  <div className="add-student-actions">
                    <button
                      type="button"
                      className="students-action-btn secondary"
                      onClick={() => {
                        if (selectedStudent) {
                          setEditableStudent({
                            name: String(selectedStudent?.name || ""),
                            year: String(selectedStudent?.year || "1st Year"),
                            department: String(selectedStudent?.department || "Computer Science and Engineering"),
                            email: String(selectedStudent?.email || ""),
                            phone: String(selectedStudent?.phone || ""),
                            regNo: String(selectedStudent?.regNo || ""),
                          });
                        }
                        setIsEditingStudent(false);
                        setEditStudentError("");
                      }}
                      disabled={isSavingStudent}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="students-action-btn"
                      disabled={isSavingStudent}
                    >
                      {isSavingStudent ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {showAddStudentModal && (
          <div
            className="student-modal-overlay"
            onClick={() => {
              if (!isAddingStudent) {
                setShowAddStudentModal(false);
                resetAddStudentForm();
              }
            }}
          >
            <div
              className="student-modal add-student-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Add Student</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAddingStudent) {
                      setShowAddStudentModal(false);
                      resetAddStudentForm();
                    }
                  }}
                >
                  x
                </button>
              </div>

              <form className="add-student-form" onSubmit={handleAddStudent}>
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    value={newStudent.name}
                    onChange={handleAddStudentChange}
                    required
                  />
                </label>

                <label>
                  Register No
                  <input
                    type="text"
                    name="regNo"
                    value={newStudent.regNo}
                    onChange={handleAddStudentChange}
                    required
                  />
                </label>

                <label>
                  Year
                  <select
                    name="year"
                    value={newStudent.year}
                    onChange={handleAddStudentChange}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </label>

                <label>
                  Department
                  <select
                    name="department"
                    value={newStudent.department}
                    onChange={handleAddStudentChange}
                  >
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                    <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                  </select>
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={newStudent.email}
                    onChange={handleAddStudentChange}
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={newStudent.phone}
                    onChange={handleAddStudentChange}
                  />
                </label>

                {addStudentError && (
                  <p className="add-student-error">{addStudentError}</p>
                )}

                <div className="add-student-actions">
                  <button
                    type="button"
                    className="students-action-btn secondary"
                    onClick={() => {
                      if (!isAddingStudent) {
                        setShowAddStudentModal(false);
                        resetAddStudentForm();
                      }
                    }}
                    disabled={isAddingStudent}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="students-action-btn"
                    disabled={isAddingStudent}
                  >
                    {isAddingStudent ? "Adding..." : "Save Student"}
                  </button>
                </div>
              </form>
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

