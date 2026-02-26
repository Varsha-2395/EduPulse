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
router.get("/", verifyToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const regNo = String(req.body?.regNo || "").trim();

    if (!regNo) {
      return res.status(400).json({ message: "Register number is required" });
    }

    const student = await Student.findOne({ regNo });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const recipientEmail = String(
      student.email || student.emailId || student.mail || ""
    ).trim().toLowerCase();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);

    if (!isValidEmail) {
      return res.status(400).json({
        message: "Valid student email not available for this register number",
      });
    }

    const otp = generateOTP();
    const logoPath = path.resolve(__dirname, "../../frontend/public/edupulse-logo.png");
    const hasLogo = fs.existsSync(logoPath);

    console.log("Generated OTP:", otp);

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
      return res.status(400).json({
        message: "Recipient email is empty",
      });
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

    res.json({
      message: "OTP sent successfully 😌🔥",
      otp, // ✅ Demo மட்டும்
    });

  } catch (err) {
    console.error("Send OTP failed:", err);
    res.status(500).json({
      message: "Failed to send OTP",
      error: err.message,
      recipient: null,
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
module.exports = router;
