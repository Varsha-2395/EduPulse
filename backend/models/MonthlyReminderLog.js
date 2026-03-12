const mongoose = require("mongoose");

const MonthlyReminderLogSchema = new mongoose.Schema(
  {
    monthKey: { type: String, required: true, unique: true },
    sentAt: { type: Date, default: Date.now },
    recipientCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["sent", "skipped"],
      default: "sent",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MonthlyReminderLog", MonthlyReminderLogSchema);
