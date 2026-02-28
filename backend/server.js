const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const studentRoutes = require("./routes/students");
const feedbackRoutes = require("./routes/feedback"); 
const adminRoutes = require("./routes/admin");

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/edupulse")
  .then(() => console.log("MongoDB Connected 😎🔥"))
  .catch((err) => console.log("MongoDB Error ❌", err));

// ✅ FIXED ROUTE
app.use("/api/students", studentRoutes);
app.use("/api/feedback", feedbackRoutes); 
app.use("/api/admin", adminRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
