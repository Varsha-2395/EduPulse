import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/students.css";

const Students = () => {
  const baseStudents = [
    { id: 1, name: "Arun Kumar", year: "1st Year", department: "CSE", email: "arun@gmail.com", phone: "9876543210", feedback: "The faculty explained concepts clearly and handled doubts patiently." },
    { id: 2, name: "Divya M", year: "2nd Year", department: "IT", email: "divya@gmail.com", phone: "9123456780", feedback: "Lab sessions are useful but more practical time would help." },
    { id: 3, name: "Rahul S", year: "3rd Year", department: "ECE", email: "rahul@gmail.com", phone: "9988776655", feedback: "Classes are informative and the pace is comfortable for learning." },
    { id: 4, name: "Sneha R", year: "4th Year", department: "EEE", email: "sneha@gmail.com", phone: "9012345678", feedback: "Notes are good and revision sessions before exams are very helpful." },
    { id: 5, name: "Karthik P", year: "1st Year", department: "IT", email: "karthik@gmail.com", phone: "9871203456", feedback: "Teaching is good and examples from real projects make topics easy." },
    { id: 6, name: "Meena K", year: "2nd Year", department: "CSE", email: "meena@gmail.com", phone: "9090909090", feedback: "Faculty support is strong and classroom interaction is encouraging." },
    { id: 7, name: "Vignesh T", year: "3rd Year", department: "EEE", email: "vignesh@gmail.com", phone: "9786453210", feedback: "The subject is interesting and weekly tests improve understanding." },
    { id: 8, name: "Priya L", year: "4th Year", department: "ECE", email: "priya@gmail.com", phone: "9345678901", feedback: "Syllabus coverage is complete and doubt clarification is quick." },
    { id: 9, name: "Santhosh B", year: "1st Year", department: "ECE", email: "santhosh@gmail.com", phone: "9654321870", feedback: "Lectures are engaging and the teaching method is student friendly." },
    { id: 10, name: "Lavanya N", year: "2nd Year", department: "EEE", email: "lavanya@gmail.com", phone: "9001234567", feedback: "Department events help us learn beyond textbooks." },
    { id: 11, name: "Dinesh V", year: "3rd Year", department: "IT", email: "dinesh@gmail.com", phone: "9887766554", feedback: "Assignments are relevant and improve problem-solving skills." },
    { id: 12, name: "Harini G", year: "4th Year", department: "CSE", email: "harini@gmail.com", phone: "9445566778", feedback: "Faculty guidance for mini projects is very supportive." },
    { id: 13, name: "Ajay R", year: "1st Year", department: "EEE", email: "ajay@gmail.com", phone: "9234567810", feedback: "The classroom atmosphere is positive and disciplined." },
    { id: 14, name: "Nisha P", year: "2nd Year", department: "ECE", email: "nisha@gmail.com", phone: "9567843210", feedback: "More group activities would make learning even better." },
    { id: 15, name: "Pradeep A", year: "3rd Year", department: "CSE", email: "pradeep@gmail.com", phone: "9898989898", feedback: "Teaching quality is consistent and easy to follow." },
    { id: 16, name: "Madhan J", year: "4th Year", department: "IT", email: "madhan@gmail.com", phone: "9382716450", feedback: "Concept explanations are strong and practical demos are helpful." },
    { id: 17, name: "Kavya S", year: "1st Year", department: "CSE", email: "kavya@gmail.com", phone: "9784312567", feedback: "Faculty is approachable and motivates students regularly." },
    { id: 18, name: "Hari D", year: "2nd Year", department: "EEE", email: "hari@gmail.com", phone: "9011789345", feedback: "Internal assessments are fair and feedback is constructive." },
    { id: 19, name: "Monika T", year: "3rd Year", department: "IT", email: "monika@gmail.com", phone: "9678123450", feedback: "Course delivery is smooth and notes are easy to revise." },
    { id: 20, name: "Surya K", year: "4th Year", department: "ECE", email: "surya@gmail.com", phone: "9301456782", feedback: "Seminars and presentation sessions build confidence." },
    { id: 21, name: "Rithik M", year: "1st Year", department: "ECE", email: "rithik@gmail.com", phone: "9876001234", feedback: "The teaching is clear and examples are easy to understand." },
    { id: 22, name: "Anitha C", year: "2nd Year", department: "CSE", email: "anitha@gmail.com", phone: "9888004321", feedback: "Faculty provides timely guidance for tests and assignments." },
    { id: 23, name: "Yogesh R", year: "3rd Year", department: "EEE", email: "yogesh@gmail.com", phone: "9797005678", feedback: "Lab equipment is good and sessions are well organized." },
    { id: 24, name: "Shruthi N", year: "4th Year", department: "IT", email: "shruthi@gmail.com", phone: "9965006789", feedback: "Overall teaching quality is good and expectations are clear." },
    { id: 25, name: "Kiran B", year: "1st Year", department: "IT", email: "kiran@gmail.com", phone: "9873124509", feedback: "Faculty is punctual and completes portions on time." },
    { id: 26, name: "Pooja H", year: "2nd Year", department: "ECE", email: "pooja@gmail.com", phone: "9912345087", feedback: "Class discussions improve our understanding of core topics." },
    { id: 27, name: "Naveen E", year: "3rd Year", department: "CSE", email: "naveen@gmail.com", phone: "9845612307", feedback: "Project mentoring is useful and guidance is practical." },
    { id: 28, name: "Deepa I", year: "4th Year", department: "EEE", email: "deepa@gmail.com", phone: "9078563412", feedback: "Teaching style is interactive and student participation is high." },
    { id: 29, name: "Sathya W", year: "1st Year", department: "EEE", email: "sathya@gmail.com", phone: "9765432091", feedback: "Faculty explains difficult topics in a simple way." },
    { id: 30, name: "Akash U", year: "2nd Year", department: "CSE", email: "akash@gmail.com", phone: "9856234098", feedback: "Course pace is balanced and doubt sessions are effective." },
  ];

  const studentsData = baseStudents.map((student, index) => {
    const history = [
      {
        submittedOn: "2026-01-12",
        comment: student.feedback,
      },
      {
        submittedOn: "2026-01-29",
        comment: `${student.department} classes are well planned and easy to follow every week.`,
      },
    ];

    if (index % 2 === 0) {
      history.push({
        submittedOn: "2026-02-10",
        comment: "Need a little more time for revision before internal assessments.",
      });
    }

    return {
      ...student,
      feedbackHistory: history,
    };
  });

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
                    <p className="feedback-date">Submitted On: {entry.submittedOn}</p>
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
