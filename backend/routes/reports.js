const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildReportQuery = (params = {}) => {
  const { department, year, fromDate, toDate, sentiment } = params;
  const query = {};

  if (department && department !== "All") {
    const departmentAliases = {
      CSE: ["CSE", "Computer Science", "Computer Science and Engineering"],
      IT: ["IT", "Information Technology"],
      ECE: [
        "ECE",
        "Electronics and Communication",
        "Electronics and Communication Engineering",
      ],
      EEE: [
        "EEE",
        "Electrical and Electronics",
        "Electrical and Electronics Engineering",
      ],
    };

    const values = departmentAliases[department] || [department];
    query.department = {
      $regex: values.map(escapeRegex).join("|"),
      $options: "i",
    };
  }

  if (year && year !== "All") {
    const yearAliases = {
      "1st Year": ["1st Year", "First Year", "Year 1", "I Year"],
      "2nd Year": ["2nd Year", "Second Year", "Year 2", "II Year"],
      "3rd Year": ["3rd Year", "Third Year", "Year 3", "III Year"],
      "4th Year": ["4th Year", "Fourth Year", "Final Year", "Year 4", "IV Year"],
    };

    const values = yearAliases[year] || [year];
    query.year = {
      $regex: values.map(escapeRegex).join("|"),
      $options: "i",
    };
  }

  if (sentiment && sentiment !== "All") {
    query.sentiment = {
      $regex: `^${escapeRegex(sentiment)}$`,
      $options: "i",
    };
  }

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) {
      query.createdAt.$gte = new Date(fromDate);
    }
    if (toDate) {
      const toDateEnd = new Date(toDate);
      toDateEnd.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDateEnd;
    }
  }

  return query;
};

const toCsvCell = (value = "") => `"${String(value).replace(/"/g, '""')}"`;
const toDepartmentShort = (value = "") => {
  const source = String(value || "").toLowerCase();
  if (source.includes("computer science")) return "CSE";
  if (source.includes("information technology")) return "IT";
  if (source.includes("electronics and communication")) return "ECE";
  if (source.includes("electrical and electronics")) return "EEE";
  return value || "-";
};
const sanitizeFilePart = (value = "") =>
  String(value || "All")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-");
const normalizePdfText = (text = "") =>
  String(text || "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const escapePdfText = (text = "") =>
  String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
const clipText = (text = "", max = 40) => {
  const source = normalizePdfText(text);
  return source.length > max ? `${source.slice(0, max - 3)}...` : source;
};

const buildOverallReportPdf = ({
  totalStudents = 0,
  totalSubmitted = 0,
  totalNotSubmitted = 0,
  sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 },
  departmentSummaries = [],
  filters = {},
}) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const content = [];

  const drawText = (x, y, text, size = 10, bold = false, color = "0.14 0.14 0.14") => {
    const font = bold ? "/F2" : "/F1";
    content.push(`${color} rg`);
    content.push(`BT ${font} ${size} Tf ${x} ${y} Td`);
    content.push(`(${escapePdfText(normalizePdfText(text) || "-")}) Tj`);
    content.push("ET");
  };

  const drawCard = (
    x,
    y,
    w,
    h,
    title,
    fillColor = "0.985 0.989 1",
    strokeColor = "0.86 0.88 0.94",
    titleColor = "0.11 0.21 0.43"
  ) => {
    content.push(`${fillColor} rg`);
    content.push(`${x} ${y} ${w} ${h} re f`);
    content.push(`${strokeColor} rg`);
    content.push(`${x} ${y} ${w} ${h} re S`);
    drawText(x + 12, y + h - 16, title, 10, true, titleColor);
  };

  const wrapLines = (text = "", maxPerLine = 44) => {
    const source = normalizePdfText(text);
    if (!source) return ["-"];
    const words = source.split(" ");
    const lines = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxPerLine) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };
  const drawRect = (x, y, w, h, fillColor = "1 1 1", strokeColor = "0.86 0.88 0.94") => {
    content.push(`${fillColor} rg`);
    content.push(`${x} ${y} ${w} ${h} re f`);
    content.push(`${strokeColor} rg`);
    content.push(`${x} ${y} ${w} ${h} re S`);
  };

  drawRect(0, pageHeight - 92, pageWidth, 92, "0.93 0.96 1", "0.93 0.96 1");
  drawText(28, pageHeight - 36, "EduPulse Overall Submission Report", 19, true, "0.09 0.18 0.36");
  drawText(
    28,
    pageHeight - 54,
    `Generated On: ${new Date().toLocaleString("en-IN")}`,
    9,
    false,
    "0.24 0.30 0.42"
  );
  const appliedDate = filters.fromDate || filters.toDate
    ? `Date Filter: ${filters.fromDate || "Start"} to ${filters.toDate || "Today"}`
    : "Date Filter: All Time";
  drawText(28, pageHeight - 68, appliedDate, 9, false, "0.24 0.30 0.42");

  drawCard(24, 680, 547, 62, "Overview");
  drawText(40, 703, `Total Students: ${totalStudents}`, 10, true, "0.09 0.18 0.36");
  drawText(220, 703, `Submitted: ${totalSubmitted}`, 10, true, "0.10 0.42 0.27");
  drawText(380, 703, `Not Submitted: ${totalNotSubmitted}`, 10, true, "0.60 0.14 0.14");

  drawCard(24, 592, 547, 78, "Sentiment Summary");
  drawRect(38, 606, 160, 30, "0.91 0.98 0.93", "0.73 0.90 0.77");
  drawRect(218, 606, 160, 30, "0.99 0.97 0.89", "0.95 0.86 0.57");
  drawRect(398, 606, 160, 30, "0.99 0.92 0.92", "0.95 0.71 0.71");
  drawText(50, 617, `Positive: ${sentimentCounts.Positive || 0}`, 9, true, "0.11 0.43 0.27");
  drawText(232, 617, `Neutral: ${sentimentCounts.Neutral || 0}`, 9, true, "0.56 0.43 0.04");
  drawText(412, 617, `Negative: ${sentimentCounts.Negative || 0}`, 9, true, "0.66 0.12 0.12");

  const ordered = departmentSummaries.sort((a, b) => {
    const weight = { CSE: 1, IT: 2, ECE: 3, EEE: 4 };
    return (weight[a.department] || 99) - (weight[b.department] || 99);
  });

  drawCard(24, 518, 547, 46, "Department Submission Details");
  drawRect(34, 494, 527, 20, "0.91 0.94 0.99", "0.81 0.86 0.95");
  drawText(40, 500, "Department", 8, true, "0.16 0.24 0.39");
  drawText(136, 500, "Total", 8, true, "0.16 0.24 0.39");
  drawText(185, 500, "Submitted", 8, true, "0.16 0.24 0.39");
  drawText(255, 500, "Not Submitted", 8, true, "0.16 0.24 0.39");
  drawText(352, 500, "Who Did Not Submit", 8, true, "0.16 0.24 0.39");

  const rowHeight = 54;
  const rows = ordered.slice(0, 7);
  rows.forEach((dept, idx) => {
    const y = 494 - (idx + 1) * rowHeight;
    drawRect(
      34,
      y,
      527,
      rowHeight - 5,
      idx % 2 === 0 ? "0.988 0.992 1" : "1 1 1",
      "0.88 0.90 0.95"
    );

    drawText(40, y + rowHeight - 18, `${dept.department}`, 9, true, "0.10 0.18 0.33");
    drawText(136, y + rowHeight - 18, `${dept.totalStudents}`, 9, false, "0.18 0.18 0.20");
    drawText(190, y + rowHeight - 18, `${dept.submittedCount}`, 9, false, "0.10 0.42 0.27");
    drawText(270, y + rowHeight - 18, `${dept.notSubmittedCount}`, 9, false, "0.60 0.14 0.14");

    const suffix = dept.moreNotSubmittedCount > 0 ? ` (+${dept.moreNotSubmittedCount} more)` : "";
    const notSubmittedText = dept.notSubmittedNames.length
      ? `${dept.notSubmittedNames.join(", ")}${suffix}`
      : "None";
    const lines = wrapLines(notSubmittedText, 42).slice(0, 2);
    lines.forEach((line, lineIdx) => {
      drawText(352, y + rowHeight - 18 - lineIdx * 11, line, 8, false, "0.22 0.24 0.29");
    });
  });

  if (ordered.length > rows.length) {
    drawText(
      34,
      58,
      `Note: ${ordered.length - rows.length} more departments are not shown on this page.`,
      9,
      false,
      "0.36 0.40 0.48"
    );
  }

  const streamContent = content.join("\n");
  const objects = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`
  );
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");
  objects.push(
    `6 0 obj\n<< /Length ${Buffer.byteLength(streamContent, "utf8")} >>\nstream\n${streamContent}\nendstream\nendobj\n`
  );

  let body = "";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength("%PDF-1.4\n" + body, "utf8"));
    body += obj;
  });

  const xrefStart = Buffer.byteLength("%PDF-1.4\n" + body, "utf8");
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    `${xrefStart}`,
    "%%EOF",
  ].join("\n");

  return `%PDF-1.4\n${body}${xref}`;
};

const buildStyledReportPdf = ({ department, year, total, rows }) => {
  const clip = (text = "", max = 40) => clipText(text, max);
  const wrapText = (text = "", maxPerLine = 42) => {
    const source = normalizePdfText(text);
    if (!source) return ["-"];

    const words = source.split(" ");
    const lines = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxPerLine) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
        }
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }

    return lines;
  };

  const pageWidth = 842;
  const pageHeight = 595;
  const left = 40;
  const tableWidth = pageWidth - 80;
  const tableTop = 390;
  const baseRowHeight = 26;

  const columns = [
    { key: "date", label: "Date", width: 95 },
    { key: "student", label: "Student", width: 110 },
    { key: "department", label: "Department", width: 145 },
    { key: "year", label: "Year", width: 90 },
    { key: "rating", label: "Rating", width: 85 },
    { key: "comment", label: "Comment", width: 237 },
  ];

  const tableRows = rows.slice(0, 9);
  const content = [];

  content.push("0.12 0.15 0.25 rg");
  content.push("BT /F2 24 Tf 40 540 Td");
  content.push(`(${escapePdfText("EduPulse Feedback Report")}) Tj`);
  content.push("ET");

  content.push("0.18 0.18 0.18 rg");
  content.push("BT /F1 13 Tf 40 500 Td");
  content.push(`(${escapePdfText(`Department: ${department} | Year: ${year}`)}) Tj`);
  content.push("ET");

  content.push("BT /F1 13 Tf 40 472 Td");
  content.push(`(${escapePdfText(`Total Submissions: ${total}`)}) Tj`);
  content.push("ET");

  content.push("0.31 0.27 0.90 rg");
  content.push(`${left} ${tableTop} ${tableWidth} ${baseRowHeight} re f`);

  let x = left;
  columns.forEach((col) => {
    content.push("1 1 1 rg");
    content.push(`BT /F2 11 Tf ${x + 10} ${tableTop + 9} Td`);
    content.push(`(${escapePdfText(col.label)}) Tj`);
    content.push("ET");
    x += col.width;
  });

  // Tracks the top edge where the next data row should end.
  let rowTop = tableTop;
  tableRows.forEach((row, idx) => {
    const commentLines = wrapText(row.comment, 46).slice(0, 3);
    const rowHeight = baseRowHeight + (commentLines.length - 1) * 12;
    const y = rowTop - rowHeight;

    if (y < 60) {
      return;
    }

    if (idx % 2 === 0) {
      content.push("0.95 0.96 0.99 rg");
      content.push(`${left} ${y} ${tableWidth} ${rowHeight} re f`);
    }

    const values = {
      date: clip(row.date, 10),
      student: clip(row.student, 17),
      department: clip(row.department, 22),
      year: clip(row.year, 12),
      rating: clip(row.rating, 10),
      comment: commentLines,
    };

    let colX = left;
    columns.forEach((col) => {
      content.push("0.22 0.22 0.22 rg");
      if (col.key === "comment") {
        values.comment.forEach((line, lineIndex) => {
          content.push(`BT /F1 10 Tf ${colX + 10} ${y + rowHeight - 16 - lineIndex * 12} Td`);
          content.push(`(${escapePdfText(line || "-")}) Tj`);
          content.push("ET");
        });
      } else {
        content.push(`BT /F1 10 Tf ${colX + 10} ${y + rowHeight - 16} Td`);
        content.push(`(${escapePdfText(values[col.key] || "-")}) Tj`);
        content.push("ET");
      }
      colX += col.width;
    });

    rowTop = y;
  });

  const streamContent = content.join("\n");
  const objects = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`
  );
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");
  objects.push(
    `6 0 obj\n<< /Length ${Buffer.byteLength(streamContent, "utf8")} >>\nstream\n${streamContent}\nendstream\nendobj\n`
  );

  let body = "";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength("%PDF-1.4\n" + body, "utf8"));
    body += obj;
  });

  const xrefStart = Buffer.byteLength("%PDF-1.4\n" + body, "utf8");
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    `${xrefStart}`,
    "%%EOF",
  ].join("\n");

  return `%PDF-1.4\n${body}${xref}`;
};
router.get('/', async (req, res) => {
  try {
    const query = buildReportQuery(req.query);

    const sentimentStats = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$sentiment",
          count: { $sum: 1 },
        },
      },
    ]);

    const departmentStats = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Feedback.countDocuments(query);

    res.json({
      sentimentStats,
      departmentStats,
      total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/download-excel", async (req, res) => {
  try {
    const query = buildReportQuery(req.query);
    const rows = await Feedback.find(query).sort({ createdAt: -1 }).lean();
    const regNos = [...new Set(rows.map((row) => row.regNo).filter(Boolean))];
    const students = regNos.length
      ? await Student.find({ regNo: { $in: regNos } })
          .select("regNo name email phone")
          .lean()
      : [];
    const studentByRegNo = new Map(
      students.map((student) => [String(student.regNo), student])
    );

    const header = [
      "DateTime",
      "StudentName",
      "RegNo",
      "Email",
      "Phone",
      "Department",
      "Year",
      "Sentiment",
      "Comments",
    ];
    const csvRows = [
      header.join(","),
      ...rows.map((row) => {
        const student = studentByRegNo.get(String(row.regNo || "")) || {};
        return [
          toCsvCell(new Date(row.createdAt).toLocaleString("en-IN")),
          toCsvCell(student.name || ""),
          toCsvCell(row.regNo || ""),
          toCsvCell(student.email || ""),
          toCsvCell(student.phone || ""),
          toCsvCell(row.department || ""),
          toCsvCell(row.year || ""),
          toCsvCell(row.sentiment || ""),
          toCsvCell(row.comments || ""),
        ].join(",");
      }),
    ];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=reports.csv");
    res.send(csvRows.join("\n"));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to download excel" });
  }
});

router.get("/download-pdf", async (req, res) => {
  try {
    const query = buildReportQuery(req.query);
    const rows = await Feedback.find(query).sort({ createdAt: -1 }).limit(100).lean();
    const regNos = [...new Set(rows.map((row) => row.regNo).filter(Boolean))];
    const students = regNos.length
      ? await Student.find({ regNo: { $in: regNos } }).select("regNo name").lean()
      : [];
    const studentByRegNo = new Map(
      students.map((student) => [String(student.regNo), student.name || "-"])
    );

    const printableRows = rows.map((row) => ({
      date: row.createdAt ? new Date(row.createdAt).toISOString().split("T")[0] : "-",
      student: studentByRegNo.get(String(row.regNo || "")) || "-",
      department: toDepartmentShort(row.department || "-"),
      year: row.year || "-",
      rating: row.sentiment || "-",
      comment: row.comments || "-",
    }));

    const selectedDepartment = toDepartmentShort(req.query.department || "All");
    const selectedYear = req.query.year || "All";
    const datePart = new Date().toISOString().split("T")[0];
    const fileName = `feedback-report-${sanitizeFilePart(selectedDepartment)}-${sanitizeFilePart(selectedYear)}-${datePart}.pdf`;

    const pdfContent = buildStyledReportPdf({
      department: selectedDepartment,
      year: selectedYear,
      total: rows.length,
      rows: printableRows,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(Buffer.from(pdfContent, "utf8"));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to download pdf" });
  }
});

router.get("/download-overall-pdf", async (req, res) => {
  try {
    const query = buildReportQuery(req.query);
    const [students, submittedRegNosRaw, sentimentRaw] = await Promise.all([
      Student.find({})
        .select("name regNo department")
        .lean(),
      Feedback.distinct("regNo", {
        ...query,
        regNo: { $exists: true, $ne: "" },
      }),
      Feedback.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$sentiment",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const submittedRegNos = new Set(
      submittedRegNosRaw.map((regNo) => String(regNo || "").trim().toUpperCase())
    );
    const byDepartment = new Map();

    students.forEach((student) => {
      const department = toDepartmentShort(student.department || "Unknown");
      if (!byDepartment.has(department)) {
        byDepartment.set(department, {
          department,
          totalStudents: 0,
          submittedCount: 0,
          notSubmittedCount: 0,
          notSubmittedNames: [],
        });
      }
      const bucket = byDepartment.get(department);
      const regNo = String(student.regNo || "").trim().toUpperCase();
      const studentName = student.name || student.regNo || "Unnamed";
      bucket.totalStudents += 1;

      if (regNo && submittedRegNos.has(regNo)) {
        bucket.submittedCount += 1;
      } else {
        bucket.notSubmittedCount += 1;
        bucket.notSubmittedNames.push(studentName);
      }
    });

    const departmentSummaries = [...byDepartment.values()].map((item) => {
      const previewLimit = 10;
      return {
        ...item,
        notSubmittedNames: item.notSubmittedNames.slice(0, previewLimit),
        moreNotSubmittedCount: Math.max(item.notSubmittedNames.length - previewLimit, 0),
      };
    });
    const totalStudents = students.length;
    const totalSubmitted = departmentSummaries.reduce((sum, item) => sum + item.submittedCount, 0);
    const totalNotSubmitted = Math.max(totalStudents - totalSubmitted, 0);
    const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
    sentimentRaw.forEach((item) => {
      const key = String(item._id || "");
      if (Object.prototype.hasOwnProperty.call(sentimentCounts, key)) {
        sentimentCounts[key] = item.count || 0;
      }
    });

    const pdfContent = buildOverallReportPdf({
      totalStudents,
      totalSubmitted,
      totalNotSubmitted,
      sentimentCounts,
      departmentSummaries,
      filters: {
        fromDate: req.query.fromDate || "",
        toDate: req.query.toDate || "",
      },
    });

    const datePart = new Date().toISOString().split("T")[0];
    const fileName = `overall-feedback-report-${datePart}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(Buffer.from(pdfContent, "utf8"));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to download overall report pdf" });
  }
});

module.exports = router;

