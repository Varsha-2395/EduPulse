const express = require("express");
const router = express.Router();
const axios = require("axios");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const verifyToken = require("../middleware/auth");
const HF_MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest";
const getHfApiKey = () => String(process.env.HF_API_KEY || "").trim();

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

const sentimentLabelMap = {
  POSITIVE: "Positive",
  NEUTRAL: "Neutral",
  NEGATIVE: "Negative",
  LABEL_0: "Negative",
  LABEL_1: "Neutral",
  LABEL_2: "Positive",
};

const toSentiment = (label = "") => sentimentLabelMap[String(label).trim().toUpperCase()] || "";

const parseSentimentLabel = (data) => {
  if (!data) return "";

  if (Array.isArray(data)) {
    if (Array.isArray(data[0])) {
      const ranked = [...data[0]].sort((a, b) => (b?.score || 0) - (a?.score || 0));
      return ranked[0]?.label || "";
    }
    const ranked = [...data].sort((a, b) => (b?.score || 0) - (a?.score || 0));
    return ranked[0]?.label || "";
  }

  if (typeof data === "object") {
    return data.label || "";
  }

  return "";
};

const analyzeSentiment = async (text) => {
  const hfApiKey = getHfApiKey();
  if (!hfApiKey) {
    const err = new Error("HF_API_KEY missing");
    err.statusCode = 500;
    throw err;
  }

  try {
    const response = await axios.post(
      HF_MODEL_URL,
      {
        inputs: text,
        options: { wait_for_model: true },
      },
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
        },
        timeout: 15000,
      }
    );

    if (response?.data?.error) {
      const err = new Error(`Hugging Face error: ${response.data.error}`);
      err.statusCode = 502;
      throw err;
    }

    const mapped = toSentiment(parseSentimentLabel(response.data));
    if (!mapped) {
      const err = new Error("Unable to map sentiment label from Hugging Face response");
      err.statusCode = 502;
      throw err;
    }
    return mapped;
  } catch (error) {
    const hfError = error.response?.data || error.message;
    console.log("Sentiment API error:", hfError);
    if (error.statusCode) throw error;

    const err = new Error("Sentiment API request failed");
    err.statusCode = 502;
    throw err;
  }
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
      sentiment: await analyzeSentiment(comments),
      department: req.body?.department || student?.department || "",
      year: req.body?.year || student?.year || "",
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback stored successfully",
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
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
