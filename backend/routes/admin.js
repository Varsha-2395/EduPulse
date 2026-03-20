const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const verifyToken = require("../middleware/auth");
const { sendMonthlyFeedbackReminder } = require("../controllers/monthlyFeedbackReminderJob");

console.log("Admin route loaded");

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";
const DEFAULT_ADMIN_USERNAME = String(process.env.DEFAULT_ADMIN_USERNAME || "").trim();
const DEFAULT_ADMIN_PASSWORD = String(process.env.DEFAULT_ADMIN_PASSWORD || "").trim();
const DEFAULT_ADMIN_EMAIL = String(process.env.DEFAULT_ADMIN_EMAIL || "edupulse2026@gmail.com")
  .trim()
  .toLowerCase();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findAdminByUsernameAcrossCollections = async (rawUsername) => {
  const db = Admin.db?.db;

  if (!db) {
    return null;
  }

  const toStringMatch = {
    $expr: { $eq: [{ $toString: "$username" }, rawUsername] },
  };

  let doc = await db.collection("admins").findOne(toStringMatch);
  if (doc) {
    return doc;
  }

  doc = await db.collection("admin").findOne(toStringMatch);
  return doc || null;
};

router.post("/login", async (req, res) => {
  try {
    const rawIdentifier = String(
      req.body?.identifier ?? req.body?.email ?? req.body?.username ?? req.body?.adminId ?? ""
    ).trim();
    const identifierLower = rawIdentifier.toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: "Email/Username and password are required" });
    }

    const usernameRegex = new RegExp(`^${escapeRegex(rawIdentifier)}$`, "i");
    let admin = await Admin.findOne({
      $or: [
        { username: rawIdentifier },
        { username: usernameRegex },
        { adminId: rawIdentifier },
        { email: identifierLower },
      ],
    });

    if (!admin) {
      admin = await findAdminByUsernameAcrossCollections(rawIdentifier);
    }

    if (!admin && DEFAULT_ADMIN_USERNAME && DEFAULT_ADMIN_PASSWORD) {
      const isDefaultLogin =
        (identifierLower === DEFAULT_ADMIN_USERNAME.toLowerCase() ||
          identifierLower === DEFAULT_ADMIN_EMAIL) &&
        password === DEFAULT_ADMIN_PASSWORD;

      if (isDefaultLogin) {
        admin = await Admin.findOneAndUpdate(
          { username: DEFAULT_ADMIN_USERNAME },
          {
            $setOnInsert: {
              username: DEFAULT_ADMIN_USERNAME,
              email: DEFAULT_ADMIN_EMAIL,
              password: DEFAULT_ADMIN_PASSWORD,
            },
          },
          { upsert: true, returnDocument: "after" }
        );
      }
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (String(admin.password) !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/monthly-reminder/test", verifyToken, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const result = await sendMonthlyFeedbackReminder({ force: true });

    if (!result) {
      return res.status(500).json({ message: "Manual reminder trigger did not complete" });
    }

    return res.json({
      message: "Monthly reminder test mail sent",
      ...result,
    });
  } catch (error) {
    console.log("Manual monthly reminder error:", error.message);
    return res.status(500).json({ message: error.message || "Failed to send test reminder" });
  }
});

module.exports = router;
