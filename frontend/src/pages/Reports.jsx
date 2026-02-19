import React, { useState, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/reports.css";

const Reports = () => {
  const reportsData = [
    { id: 1, student: "Arun Kumar", department: "CSE", year: "1st Year", rating: "Positive", date: "2025-02-10" },
    { id: 2, student: "Divya", department: "IT", year: "2nd Year", rating: "Neutral", date: "2025-02-11" },
    { id: 3, student: "Rahul", department: "ECE", year: "3rd Year", rating: "Negative", date: "2025-02-12" },
    { id: 4, student: "Sneha", department: "EEE", year: "4th Year", rating: "Positive", date: "2025-02-13" },
    { id: 5, student: "Karthik", department: "IT", year: "1st Year", rating: "Positive", date: "2025-02-13" },
    { id: 6, student: "Meena", department: "CSE", year: "2nd Year", rating: "Neutral", date: "2025-02-14" },
    { id: 7, student: "Vignesh", department: "EEE", year: "3rd Year", rating: "Negative", date: "2025-02-15" },
  ];

  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const filteredReports = useMemo(() => {
    return reportsData.filter((item) => {
      const matchesDepartment =
        departmentFilter === "All" || item.department === departmentFilter;

      const matchesYear =
        yearFilter === "All" || item.year === yearFilter;

      return matchesDepartment && matchesYear;
    });
  }, [departmentFilter, yearFilter]);

  return (
    <AdminLayout>
      <div className="reports-container">
        <div className="reports-header">
          <h1>Reports</h1>
          <p>Generate & Export System Reports</p>
        </div>

        {/* Filters */}
        <div className="reports-filters">
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

        {/* Report Preview */}
        <div className="report-preview">
          <h3>Report Preview</h3>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Department</th>
                <th>Year</th>
                <th>Rating</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.student}</td>
                    <td>{item.department}</td>
                    <td>{item.year}</td>
                    <td>
                      <span className={`rating ${item.rating.toLowerCase()}`}>
                        {item.rating}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Export Buttons */}
        <div className="reports-actions">
          <button className="primary-btn">Export PDF</button>
          <button className="secondary-btn">Export CSV</button>
          <button className="ghost-btn">Print Report</button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
