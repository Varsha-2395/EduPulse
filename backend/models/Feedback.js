const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  regNo: String,
  department: String,
  year: String,
  comments: String,
  sentiment: {
    type: String,
    enum: ["Positive", "Negative", "Neutral"],
    default: "Neutral",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);