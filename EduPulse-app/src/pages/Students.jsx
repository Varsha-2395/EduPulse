import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/students.css";

const Students = () => {
  const studentsData = [
    { id: 1, name: "Arun Kumar", year: "1st Year", department: "CSE", email: "arun@gmail.com", phone: "9876543210" },
    { id: 2, name: "Divya", year: "2nd Year", department: "IT", email: "divya@gmail.com", phone: "9123456780" },
    { id: 3, name: "Rahul", year: "3rd Year", department: "ECE", email: "rahul@gmail.com", phone: "9988776655" },
    { id: 4, name: "Sneha", year: "4th Year", department: "EEE", email: "sneha@gmail.com", phone: "9012345678" },
    { id: 5, name: "Karthik", year: "1st Year", department: "IT", email: "karthik@gmail.com", phone: "9871203456" },
    { id: 6, name: "Meena", year: "2nd Year", department: "CSE", email: "meena@gmail.com", phone: "9090909090" },
    { id: 7, name: "Vignesh", year: "3rd Year", department: "EEE", email: "vignesh@gmail.com", phone: "9786453210" },
    { id: 8, name: "Priya", year: "4th Year", department: "ECE", email: "priya@gmail.com", phone: "9345678901" },
    { id: 9, name: "Santhosh", year: "1st Year", department: "ECE", email: "santhosh@gmail.com", phone: "9654321870" },
    { id: 10, name: "Lavanya", year: "2nd Year", department: "EEE", email: "lavanya@gmail.com", phone: "9001234567" },
    { id: 11, name: "Dinesh", year: "3rd Year", department: "IT", email: "dinesh@gmail.com", phone: "9887766554" },
    { id: 12, name: "Harini", year: "4th Year", department: "CSE", email: "harini@gmail.com", phone: "9445566778" },
    { id: 13, name: "Ajay", year: "1st Year", department: "EEE", email: "ajay@gmail.com", phone: "9234567810" },
    { id: 14, name: "Nisha", year: "2nd Year", department: "ECE", email: "nisha@gmail.com", phone: "9567843210" },
    { id: 15, name: "Pradeep", year: "3rd Year", department: "CSE", email: "pradeep@gmail.com", phone: "9898989898" },
  ];

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" ||
      student.department === departmentFilter;

    const matchesYear =
      yearFilter === "All" || student.year === yearFilter;

    return matchesSearch && matchesDepartment && matchesYear;
  });

  return (
    <AdminLayout>
      <div className="students-container">
        <div className="students-header">
          <h1 className="page-title">Students</h1>

          <div className="students-summary">
            <span className="students-summary-label">Total Students</span>
            <div className="students-count">
              {filteredStudents.length}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="students-controls">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="All">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>

        {/* Table */}
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
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.year}</td>
                    <td>{student.department}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
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
      </div>
    </AdminLayout>
  );
};

export default Students;
