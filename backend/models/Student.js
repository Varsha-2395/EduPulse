const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: String,
  year: String,
  department: String,
  email: String,
  phone: String,

  regNo: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("Student", StudentSchema);