const express = require("express");
const router = express.Router();

const { getFeedbackSummary } = require("../controllers/summaryController");

router.get("/feedback-summary", getFeedbackSummary);

module.exports = router;