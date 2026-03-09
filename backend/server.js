const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const studentRoutes = require("./routes/students");
const feedbackRoutes = require("./routes/feedback"); 
const adminRoutes = require("./routes/admin");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");
const sentimentRoutes = require("./routes/sentiment");
const summaryRoutes = require("./routes/summary");

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
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", sentimentRoutes);
app.use("/api", summaryRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
