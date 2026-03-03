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

const buildStyledReportPdf = ({ department, year, total, rows }) => {
  const escapePdfText = (text = "") =>
    String(text)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  const normalizePdfText = (text = "") =>
    String(text || "")
      .replace(/[^\x20-\x7E]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const clip = (text = "", max = 40) => {
    const source = normalizePdfText(text);
    return source.length > max ? `${source.slice(0, max - 3)}...` : source;
  };
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

module.exports = router;

