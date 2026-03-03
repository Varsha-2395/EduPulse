const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const verifyToken = require("../middleware/auth");

const normalizeValue = (value = "") => String(value).trim().toLowerCase();

const departmentAliases = {
  cse: ["cse", "computer science", "computer science and engineering"],
  it: ["it", "information technology"],
  ece: ["ece", "electronics and communication", "electronics and communication engineering"],
  eee: ["eee", "electrical and electronics", "electrical and electronics engineering"],
};

const yearAliases = {
  "1st year": ["1st year", "first year", "year 1", "i year"],
  "2nd year": ["2nd year", "second year", "year 2", "ii year"],
  "3rd year": ["3rd year", "third year", "year 3", "iii year"],
  "4th year": ["4th year", "fourth year", "final year", "year 4", "iv year"],
};

const matchesAlias = (filterValue, sourceValue, aliasMap) => {
  if (!filterValue || filterValue === "All") return true;
  const filterKey = normalizeValue(filterValue);
  const source = normalizeValue(sourceValue);
  const accepted = aliasMap[filterKey] || [filterKey];
  return accepted.some((item) => source.includes(item));
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const regNo = String(req.body?.regNo || "").trim();
    const comments = String(req.body?.comments || "").trim();

    if (!regNo || !comments) {
      return res.status(400).json({ message: "regNo and comments are required" });
    }

    const student = await Student.findOne({ regNo }).select("department year");

    const feedback = new Feedback({
      regNo,
      comments,
      sentiment: req.body?.sentiment,
      department: req.body?.department || student?.department || "",
      year: req.body?.year || student?.year || "",
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback stored successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin", async (req, res) => {
  try {
    const {
      department,
      year,
      fromDate,
      toDate,
      sentiment,
      keyword,
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);

    const allFeedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .lean();

    const regNos = [...new Set(allFeedbacks.map((f) => f.regNo).filter(Boolean))];
    const students = regNos.length
      ? await Student.find({ regNo: { $in: regNos } })
        .select("regNo department year")
        .lean()
      : [];

    const studentByRegNo = new Map(students.map((s) => [String(s.regNo), s]));

    const normalizedKeyword = normalizeValue(keyword);
    const normalizedSentiment = normalizeValue(sentiment);

    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const toDateObj = toDate ? new Date(toDate) : null;
    if (toDateObj) {
      toDateObj.setHours(23, 59, 59, 999);
    }

    const filtered = allFeedbacks
      .map((fb) => {
        const student = studentByRegNo.get(String(fb.regNo || ""));
        return {
          ...fb,
          department: fb.department || student?.department || "",
          year: fb.year || student?.year || "",
        };
      })
      .filter((fb) => {
        if (!matchesAlias(department, fb.department, departmentAliases)) {
          return false;
        }

        if (!matchesAlias(year, fb.year, yearAliases)) {
          return false;
        }

        if (
          sentiment &&
          sentiment !== "All" &&
          normalizeValue(fb.sentiment) !== normalizedSentiment
        ) {
          return false;
        }

        if (
          normalizedKeyword &&
          !normalizeValue(fb.comments).includes(normalizedKeyword)
        ) {
          return false;
        }

        const createdAt = fb.createdAt ? new Date(fb.createdAt) : null;
        if (!createdAt) return false;
        if (fromDateObj && createdAt < fromDateObj) return false;
        if (toDateObj && createdAt > toDateObj) return false;

        return true;
      });

    const total = filtered.length;
    const startIndex = (parsedPage - 1) * parsedLimit;
    const feedbacks = filtered.slice(startIndex, startIndex + parsedLimit);

    res.json({
      feedbacks,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      currentPage: parsedPage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:regNo", verifyToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ regNo: req.params.regNo });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
