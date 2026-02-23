const departmentOptions = ["All", "CSE", "IT", "ECE", "EEE"];
const yearOptions = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];

const studentSeed = [
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

const ratingCycle = ["Positive", "Neutral", "Negative"];

const dateByOffset = (offset) => {
  const start = new Date("2025-11-01");
  start.setDate(start.getDate() + offset * 3);
  return start.toISOString().slice(0, 10);
};

const studentsData = studentSeed.map((student, index) => {
  const history = [
    {
      submittedOn: dateByOffset(index),
      rating: ratingCycle[index % 3],
      comment: student.feedback,
    },
    {
      submittedOn: dateByOffset(index + 8),
      rating: ratingCycle[(index + 1) % 3],
      comment: `${student.department} classes are well planned and easy to follow every week.`,
    },
  ];

  if (index % 2 === 0) {
    history.push({
      submittedOn: dateByOffset(index + 16),
      rating: ratingCycle[(index + 2) % 3],
      comment: "Need a little more time for revision before internal assessments.",
    });
  }

  return {
    ...student,
    feedbackHistory: history,
  };
});

const feedbackEntries = studentsData.flatMap((student) =>
  student.feedbackHistory.map((entry, idx) => ({
    id: `${student.id}-${idx}`,
    studentId: student.id,
    student: student.name,
    department: student.department,
    year: student.year,
    date: entry.submittedOn,
    rating: entry.rating,
    comment: entry.comment,
  }))
);

const ratingCounts = feedbackEntries.reduce(
  (acc, item) => {
    const key = item.rating.toLowerCase();
    acc[key] += 1;
    return acc;
  },
  { positive: 0, neutral: 0, negative: 0 }
);

const submittedStudentIds = new Set(feedbackEntries.map((item) => item.studentId));

const dashboardMetrics = {
  totalStudents: studentsData.length,
  totalFeedback: feedbackEntries.length,
  positive: ratingCounts.positive,
  neutral: ratingCounts.neutral,
  negative: ratingCounts.negative,
  notSubmitted: studentsData.length - submittedStudentIds.size,
};

const titleMap = {
  positive: "Frequent Praise",
  neutral: "Common Feedback",
  negative: "Frequent Complaint",
};

const byClass = feedbackEntries.reduce((acc, item) => {
  const key = `${item.year} - ${item.department}`;
  acc[key] = acc[key] || [];
  acc[key].push(item);
  return acc;
}, {});

const highlightsData = Object.entries(byClass)
  .slice(0, 4)
  .map(([key, list], index) => {
    const counts = list.reduce(
      (acc, item) => {
        const rating = item.rating.toLowerCase();
        acc[rating] += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    const dominantType = ["positive", "neutral", "negative"].sort(
      (a, b) => counts[b] - counts[a]
    )[0];

    return {
      id: index + 1,
      class: key,
      type: dominantType,
      title: titleMap[dominantType],
      text: list[0]?.comment || "No feedback available",
    };
  });

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthlyTrendData = Object.entries(
  feedbackEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, count]) => {
    const [year, month] = key.split("-");
    const monthIdx = Number(month) - 1;
    return {
      label: `${monthNames[monthIdx]} ${String(year).slice(-2)}`,
      count,
    };
  });

export {
  dashboardMetrics,
  departmentOptions,
  feedbackEntries,
  highlightsData,
  monthlyTrendData,
  studentsData,
  yearOptions,
};
