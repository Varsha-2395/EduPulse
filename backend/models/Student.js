const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: String,
  year: String,
  department: String,
  email: String,
  phone: String,
});

module.exports = mongoose.model("Student", StudentSchema);