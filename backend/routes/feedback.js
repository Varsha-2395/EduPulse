const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

const {
  submitFeedback,
  getStudentFeedback,
  getAllFeedback,
} = require("../controllers/feedbackController");

/* ✅ Submit Feedback */
router.post("/", verifyToken, submitFeedback);

/* ✅ Student Feedback History */
router.get("/student/:regNo", verifyToken, getStudentFeedback);

/* ✅ Admin View */
router.get("/", verifyToken, getAllFeedback);

module.exports = router;