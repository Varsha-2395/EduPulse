const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted 😌🔥",
      feedback,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStudentFeedback = async (req, res) => {
  try {
    const { regNo } = req.params;

    const feedbacks = await Feedback.find({ regNo });

    res.json(feedbacks);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();

    res.json(feedbacks);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  submitFeedback,
  getStudentFeedback,
  getAllFeedback,
};