const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

/* ✅ Save Student */
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ✅ Get Students */
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    res.status(201).json(student); // ✅ proper status
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
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

module.exports = router;