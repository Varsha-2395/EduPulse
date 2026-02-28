const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Admin", AdminSchema, "admins");
