const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const studentRoutes = require("./routes/students");

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/edupulse")
  .then(() => console.log("MongoDB Connected 😎🔥"))
  .catch((err) => console.log("MongoDB Error ❌", err));

// Routes
app.use("/students", studentRoutes);

// Server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});