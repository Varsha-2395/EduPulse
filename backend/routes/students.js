const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Student = require("../models/Student");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");

/* ================= OTP GENERATOR ================= */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ================= MAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "edupulse2026@gmail.com",
    pass: "noamfxuvpcgviqwd", // ✅ App Password
  },
});

/* ================= JWT SECRET ================= */
const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeRegisterNumber = (value = "") => {
  const raw = String(value).trim();
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
const parseCsvLine = (line = "") => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === "\"") {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};
const sanitizeCsvCell = (value = "") => {
  let cell = String(value).trim();
  if (!cell) return "";

  if (cell.startsWith("\"") && cell.endsWith("\"")) {
    cell = cell.slice(1, -1);
  }

  cell = cell.replace(/""/g, "\"").trim();

  const excelTextMatch = cell.match(/^=\s*"(.+)"$/);
  if (excelTextMatch) {
    cell = excelTextMatch[1];
  }

  if (cell.startsWith("\"") && cell.endsWith("\"")) {
    cell = cell.slice(1, -1);
  }

  // Excel text marker (e.g., '962822104081)
  if (cell.startsWith("'")) {
    cell = cell.slice(1);
  }

  return cell.trim();
};
const canonicalRegNo = (value = "") =>
  normalizeRegisterNumber(sanitizeCsvCell(value))
    .toLowerCase()
    .replace(/\s+/g, "");

/* ================= SAVE STUDENT ================= */
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET STUDENTS ================= */
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      department = "All",
      year = "All",
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (department !== "All") {
      const departmentAliases = {
        CSE: [
          "CSE",
          "Computer Science",
          "Computer Science and Engineering",
        ],
        IT: ["IT", "Information Technology"],
        ECE: ["ECE", "Electronics and Communication", "Electronics and Communication Engineering"],
        EEE: ["EEE", "Electrical and Electronics", "Electrical and Electronics Engineering"],
      };

      const departmentValues = departmentAliases[department] || [department];
      const departmentPattern = departmentValues.map(escapeRegex).join("|");
      query.department = { $regex: departmentPattern, $options: "i" };
    }

    if (year !== "All") {
      const yearAliases = {
        "1st Year": ["1st Year", "First Year", "Year 1", "I Year"],
        "2nd Year": ["2nd Year", "Second Year", "Year 2", "II Year"],
        "3rd Year": ["3rd Year", "Third Year", "Year 3", "III Year"],
        "4th Year": ["4th Year", "Fourth Year", "Final Year", "Year 4", "IV Year"],
      };

      const yearValues = yearAliases[year] || [year];
      const yearPattern = yearValues.map(escapeRegex).join("|");
      query.year = { $regex: yearPattern, $options: "i" };
    }

    const totalStudents = await Student.countDocuments(query);

    const students = await Student.find(query)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      students,
      totalStudents,
      totalPages: Math.ceil(totalStudents / parsedLimit) || 1,
      currentPage: parsedPage,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================= DELETE STUDENT ================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE STUDENT ================= */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= STUDENT LOGIN (JWT) ================= */
router.post("/login", async (req, res) => {
  try {
    const { regNo, password } = req.body;

    const student = await Student.findOne({ regNo });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ JWT TOKEN
    const token = jwt.sign(
      { id: student._id, regNo: student.regNo },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      student,
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= VERIFY JWT ================= */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= SEND OTP ================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { otp } = await sendOtpToStudentEmail(req.body?.regNo);

    res.json({
      message: "OTP sent successfully",
      otp, // demo only
    });
  } catch (err) {
    console.error("Send OTP failed:", err);
    res.status(err.status || 500).json({
      message: err.status ? err.message : "Failed to send OTP",
      error: err.message,
      recipient: null,
    });
  }
});

/* ================= RESEND OTP ================= */
router.post("/resend-otp", async (req, res) => {
  try {
    const { otp } = await sendOtpToStudentEmail(req.body?.regNo);

    res.json({
      message: "OTP resent successfully",
      otp, // demo only
    });
  } catch (err) {
    console.error("Resend OTP failed:", err);
    res.status(err.status || 500).json({
      message: err.status ? err.message : "Failed to resend OTP",
      error: err.message,
    });
  }
});

/* ================= SET / UPDATE PASSWORD ================= */
router.post("/set-password", async (req, res) => {
  try {
    const { regNo, password } = req.body;

    let student = await Student.findOne({ regNo });

    if (student) {
      student.password = password;
      await student.save();

      return res.json({
        message: "Password updated successfully 😌🔥",
      });
    }

    student = new Student({ regNo, password });
    await student.save();

    res.json({
      message: "Student registered successfully 😌🔥",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const csv = req.file.buffer.toString("utf-8");
    const rows = csv.split("\n").map(r => r.trim()).filter(Boolean);

    if (rows.length < 2) {
      return res.status(400).json({ message: "CSV empty" });
    }

    const parsedRows = rows.slice(1).map((row) => {
      const [name, year, department, email, phone, regNo, password] = parseCsvLine(row)
        .map((value) => sanitizeCsvCell(value));

      return {
        name,
        year,
        department,
        email: email ? email.toLowerCase() : "",
        phone,
        regNo: normalizeRegisterNumber(regNo),
        password: password || "",
      };
    });

    const seenRegNo = new Set();
    const seenEmail = new Set();
    const candidates = [];
    let skippedInFile = 0;
    let skippedMissingRegNo = 0;

    for (const student of parsedRows) {
      const regNo = student.regNo || "";
      const regNoKey = canonicalRegNo(regNo);
      const email = student.email || "";

      if (!regNo) {
        skippedMissingRegNo += 1;
        continue;
      }

      if ((regNoKey && seenRegNo.has(regNoKey)) || (email && seenEmail.has(email))) {
        skippedInFile += 1;
        continue;
      }

      if (regNoKey) {
        seenRegNo.add(regNoKey);
      }

      if (email) {
        seenEmail.add(email);
      }

      candidates.push(student);
    }

    const emails = candidates.map((s) => s.email).filter(Boolean);
    const existingStudents = await Student.find(
      emails.length ? { email: { $in: emails } } : {}
    ).select("regNo email");

    const existingRegNos = new Set(
      existingStudents.map((s) => canonicalRegNo(s.regNo)).filter(Boolean)
    );
    const existingEmails = new Set(
      existingStudents.map((s) => (s.email || "").toLowerCase()).filter(Boolean)
    );

    const studentsToInsert = candidates.filter((student) => {
      const studentRegNoKey = canonicalRegNo(student.regNo);
      const hasRegNoDuplicate = studentRegNoKey && existingRegNos.has(studentRegNoKey);
      const hasEmailDuplicate = student.email && existingEmails.has(student.email);
      if (!hasRegNoDuplicate && !hasEmailDuplicate && studentRegNoKey) {
        existingRegNos.add(studentRegNoKey);
      }
      if (!hasRegNoDuplicate && !hasEmailDuplicate && student.email) {
        existingEmails.add(student.email);
      }
      return !hasRegNoDuplicate && !hasEmailDuplicate;
    });

    const skippedExisting = candidates.length - studentsToInsert.length;

    if (studentsToInsert.length) {
      await Student.insertMany(studentsToInsert);
    }

    res.json({
      message: "Import completed",
      imported: studentsToInsert.length,
      skippedExisting,
      skippedInFile,
      skippedMissingRegNo,
    });

  } catch (error) {
    console.log(error);
    if (error?.code === 11000) {
      return res.status(400).json({
        message: "Duplicate value found (regNo must be unique)",
      });
    }
    res.status(500).json({ message: "Import error", error: error.message });
  }
});

const sendOtpToStudentEmail = async (regNo) => {
  const normalizedRegNo = String(regNo || "").trim();

  if (!normalizedRegNo) {
    const error = new Error("Register number is required");
    error.status = 400;
    throw error;
  }

  const student = await Student.findOne({ regNo: normalizedRegNo });

  if (!student) {
    const error = new Error("Student not found");
    error.status = 404;
    throw error;
  }

  const recipientEmail = String(
    student.email || student.emailId || student.mail || ""
  ).trim().toLowerCase();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);
  if (!isValidEmail) {
    const error = new Error("Valid student email not available for this register number");
    error.status = 400;
    throw error;
  }

  const otp = generateOTP();
  const logoPath = path.resolve(__dirname, "../../frontend/public/edupulse-logo.png");
  const hasLogo = fs.existsSync(logoPath);

  const otpHtml = `
      <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="padding:20px 24px;background:linear-gradient(135deg,#1d4ed8,#2563eb);text-align:center;">
            <img src="cid:edupulse-logo" alt="EduPulse" style="height:52px;object-fit:contain;background:#fff;padding:6px 10px;border-radius:10px;" />
            <p style="margin:10px 0 0;color:#dbeafe;font-size:13px;">Feedback Made Simple</p>
          </div>
          <div style="padding:24px;">
            <h2 style="margin:0 0 10px;color:#111827;font-size:20px;">OTP Verification</h2>
            <p style="margin:0 0 14px;color:#4b5563;font-size:14px;line-height:1.6;">
              Hello, your one-time password for EduPulse account verification is:
            </p>
            <div style="margin:10px 0 18px;padding:14px 18px;background:#eff6ff;border:1px dashed #60a5fa;border-radius:10px;text-align:center;">
              <span style="font-size:28px;letter-spacing:8px;font-weight:700;color:#1d4ed8;">${otp}</span>
            </div>
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
              If you did not request this OTP, please ignore this email.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated email from EduPulse.</p>
          </div>
        </div>
      </div>
    `;

  const mailOptions = {
    from: "edupulse2026@gmail.com",
    to: recipientEmail,
    subject: "EduPulse OTP Verification",
    text: `Your OTP is: ${otp}`,
    html: otpHtml,
  };

  if (!mailOptions.to || !String(mailOptions.to).trim()) {
    const error = new Error("Recipient email is empty");
    error.status = 400;
    throw error;
  }

  if (hasLogo) {
    mailOptions.attachments = [
      {
        filename: "edupulse-logo.png",
        path: logoPath,
        cid: "edupulse-logo",
      },
    ];
  }

  await transporter.sendMail(mailOptions);
  return { otp };
};

module.exports = router;



