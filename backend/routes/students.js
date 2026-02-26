const express = require("express");
const router = express.Router();
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
    const { regNo, email } = req.body;

    const otp = generateOTP();

    console.log("Generated OTP:", otp);

    await transporter.sendMail({
      from: "edupulse2026@gmail.com",
      to: email,
      subject: "EduPulse OTP Verification",
      text: `Your OTP is: ${otp}`,
    });

    res.json({
      message: "OTP sent successfully 😌🔥",
      otp, // ✅ Demo மட்டும்
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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
