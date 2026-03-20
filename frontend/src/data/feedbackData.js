const departmentOptions = ["All", "CSE", "IT", "ECE", "EEE"];
const yearOptions = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];

const studentsData = [];
const feedbackEntries = [];
const highlightsData = [];
const monthlyTrendData = [];

const dashboardMetrics = {
  totalStudents: 0,
  totalFeedback: 0,
  positive: 0,
  neutral: 0,
  negative: 0,
  notSubmitted: 0,
};

export {
  dashboardMetrics,
  departmentOptions,
  feedbackEntries,
  highlightsData,
  monthlyTrendData,
  studentsData,
  yearOptions,
};
