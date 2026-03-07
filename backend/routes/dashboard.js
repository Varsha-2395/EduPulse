const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Feedback = require("../models/Feedback");

router.get("/", async (req, res) => {
  try {
    const titleByType = {
      positive: "Frequent Praise",
      neutral: "Common Feedback",
      negative: "Frequent Complaint",
    };

    /* ===== TOTAL COUNTS ===== */
    const totalStudents = await Student.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    const positiveCount = await Feedback.countDocuments({ sentiment: "Positive" });
    const neutralCount = await Feedback.countDocuments({ sentiment: "Neutral" });
    const negativeCount = await Feedback.countDocuments({ sentiment: "Negative" });
    const submittedRegNoDocs = await Feedback.distinct("regNo", {
      regNo: { $exists: true, $ne: "" },
    });
    const submittedCount = submittedRegNoDocs.length;
    const notSubmitted = Math.max(totalStudents - submittedCount, 0);

    /* ===== MONTHLY TREND ===== */
    const monthlyTrend = await Feedback.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const formattedTrend = monthlyTrend.map(item => ({
      label: `${monthNames[item._id.month - 1]} ${String(item._id.year).slice(-2)}`,
      count: item.count
    }));

    /* ===== CLASS-WISE HIGHLIGHTS ===== */
    const rawHighlights = await Feedback.aggregate([
      {
        $group: {
          _id: {
            department: "$department",
            year: "$year",
          },
          count: { $sum: 1 },
          sampleComment: {
            $first: {
              $ifNull: ["$comments", "No feedback available"],
            },
          },
          positive: {
            $sum: {
              $cond: [{ $eq: ["$sentiment", "Positive"] }, 1, 0],
            },
          },
          neutral: {
            $sum: {
              $cond: [{ $eq: ["$sentiment", "Neutral"] }, 1, 0],
            },
          },
          negative: {
            $sum: {
              $cond: [{ $eq: ["$sentiment", "Negative"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    const highlights = rawHighlights.map((item, index) => {
      const counts = {
        positive: item.positive || 0,
        neutral: item.neutral || 0,
        negative: item.negative || 0,
      };
      const type = ["positive", "neutral", "negative"].sort(
        (a, b) => counts[b] - counts[a]
      )[0];

      return {
        id: index + 1,
        class: `${item._id.year || "-"} - ${item._id.department || "-"}`,
        type,
        title: titleByType[type],
        text: item.sampleComment || "No feedback available",
      };
    });

    res.json({
      metrics: {
        totalStudents,
        totalFeedback,
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        notSubmitted,
      },
      monthlyTrend: formattedTrend,
      highlights,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Dashboard error" });
  }
});

module.exports = router;
