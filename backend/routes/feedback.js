const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();

    console.log("Feedback saved 😌🔥");

    res.status(201).json({
      message: "Feedback stored successfully",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:regNo", verifyToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ regNo: req.params.regNo });

    res.json(feedbacks);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin", async (req, res) => {
  try {
    const {
      department,
      year,
      fromDate,
      toDate,
      sentiment,
      keyword,
      page = 1,
      limit = 5,
    } = req.query;

    const query = {};

    if (department && department !== "All") {
      query.department = department;
    }

    if (year && year !== "All") {
      query.year = year;
    }

    if (sentiment && sentiment !== "All") {
      query.sentiment = sentiment;
    }

    if (keyword) {
      query.comments = { $regex: keyword, $options: "i" };
    }

    if (fromDate && toDate) {
      query.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const total = await Feedback.countDocuments(query);

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      feedbacks,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;