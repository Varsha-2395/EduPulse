const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  regNo: String,
  subject: String,
  faculty: String,
  rating: Number,
  comments: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);