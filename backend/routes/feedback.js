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

module.exports = router;