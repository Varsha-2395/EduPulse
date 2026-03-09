const express = require("express");
const router = express.Router();
const axios = require("axios");
const Student = require("../models/Student");
const Feedback = require("../models/Feedback");

const getGeminiApiKey = () => String(process.env.GEMINI_API_KEY || "").trim();
const getGeminiModel = () => String(process.env.GEMINI_MODEL || "").trim();
const GEMINI_VERSIONS = ["v1", "v1beta"];
const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash",
];
let geminiQuotaBlockedUntil = 0;
let geminiLastQuotaLogAt = 0;
const classKey = (year = "", department = "") =>
  `${String(year).trim().toLowerCase()}||${String(department).trim().toLowerCase()}`;

const cleanComment = (value = "") =>
  String(value)
    .replace(/["'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const toConciseSentence = (value = "") => {
  const normalized = cleanComment(value);
  if (!normalized) return "";

  const sentences = normalized
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const deduped = [];
  sentences.forEach((sentence) => {
    const key = sentence.toLowerCase();
    if (!deduped.some((item) => item.toLowerCase() === key)) {
      deduped.push(sentence);
    }
  });

  const first = deduped[0] || "";
  if (!first) return "";
  const capped = first.length > 180 ? `${first.slice(0, 177)}...` : first;
  return capped.endsWith(".") ? capped : `${capped}.`;
};

const buildSummaryInput = (comments = []) => {
  const uniqueComments = [];
  comments
    .map(cleanComment)
    .filter((text) => text.length > 3)
    .forEach((text) => {
      const exists = uniqueComments.some(
        (item) => item.toLowerCase() === text.toLowerCase()
      );
      if (!exists) uniqueComments.push(text);
    });

  const combined = uniqueComments.slice(0, 8).join(". ");

  if (!combined) return "";

  // Keep payload small for stable inference latency.
  return combined.length > 1600 ? combined.slice(0, 1600) : combined;
};

const summarizeText = async (text) => {
  if (!text) return "No feedback available";
  if (Date.now() < geminiQuotaBlockedUntil) return "";

  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) return "";

  const preferredModel = getGeminiModel();
  const modelsToTry = [
    ...(preferredModel ? [preferredModel] : []),
    ...GEMINI_MODEL_CANDIDATES,
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  for (const version of GEMINI_VERSIONS) {
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${geminiApiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Summarize this class feedback in exactly one concise sentence:\n${text}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 80,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 20000,
          }
        );

        const raw = (response?.data?.candidates || [])
          .flatMap((c) => c?.content?.parts || [])
          .map((p) => p?.text || "")
          .join(" ")
          .trim();
        const concise = toConciseSentence(raw);
        if (concise) return concise;
      } catch (error) {
        const message = error.response?.data?.error?.message || error.message;
        const lowerMessage = String(message).toLowerCase();
        const quotaExceeded =
          lowerMessage.includes("quota") ||
          lowerMessage.includes("rate limit") ||
          lowerMessage.includes("resource exhausted");
        if (quotaExceeded) {
          const retryMatch = String(message).match(/retry in\s+([\d.]+)s/i);
          const retryMs = retryMatch
            ? Math.ceil(Number(retryMatch[1]) * 1000)
            : 60 * 1000;
          geminiQuotaBlockedUntil = Date.now() + retryMs;
          if (Date.now() - geminiLastQuotaLogAt > 5000) {
            console.log(`Dashboard Gemini summary API quota exceeded. Pausing requests for ${Math.ceil(retryMs / 1000)}s.`);
            geminiLastQuotaLogAt = Date.now();
          }
          return "";
        }
        const isModelNotFound = String(message).toLowerCase().includes("not found");
        if (!isModelNotFound) {
          console.log("Dashboard Gemini summary API error:", message);
          return "";
        }
      }
    }
  }

  console.log("Dashboard Gemini summary API error: No compatible Gemini model found");
  return "";
};

router.get("/", async (req, res) => {
  try {
    const titleByType = {
      positive: "Frequent Praise",
      neutral: "Common Feedback",
      negative: "Frequent Complaint",
    };

    /* ===== TOTAL COUNTS ===== */
    const totalStudents = await Student.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    const positiveCount = await Feedback.countDocuments({ sentiment: "Positive" });
    const neutralCount = await Feedback.countDocuments({ sentiment: "Neutral" });
    const negativeCount = await Feedback.countDocuments({ sentiment: "Negative" });
    const submittedRegNoDocs = await Feedback.distinct("regNo", {
      regNo: { $exists: true, $ne: "" },
    });
    const submittedCount = submittedRegNoDocs.length;
    const notSubmitted = Math.max(totalStudents - submittedCount, 0);

    /* ===== MONTHLY TREND ===== */
    const monthlyTrend = await Feedback.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const formattedTrend = monthlyTrend.map(item => ({
      label: `${monthNames[item._id.month - 1]} ${String(item._id.year).slice(-2)}`,
      count: item.count
    }));

    /* ===== CLASS-WISE HIGHLIGHTS ===== */
    const classPairs = await Student.aggregate([
      {
        $group: {
          _id: {
            department: "$department",
            year: "$year",
          },
        },
      },
      {
        $project: {
          _id: 0,
          department: { $ifNull: ["$_id.department", ""] },
          year: { $ifNull: ["$_id.year", ""] },
        },
      },
      { $sort: { year: 1, department: 1 } },
    ]);

    const feedbackByClassRaw = await Feedback.aggregate([
      {
        $group: {
          _id: {
            department: "$department",
            year: "$year",
          },
          count: { $sum: 1 },
          commentEntries: {
            $push: {
              text: { $ifNull: ["$comments", ""] },
              sentiment: { $ifNull: ["$sentiment", ""] },
            },
          },
          sampleComment: {
            $first: {
              $ifNull: ["$comments", "No feedback available"],
            },
          },
          positive: {
            $sum: {
              $cond: [{ $eq: ["$sentiment", "Positive"] }, 1, 0],
            },
          },
          neutral: {
            $sum: {
              $cond: [{ $eq: ["$sentiment", "Neutral"] }, 1, 0],
            },
          },
          negative: {
            $sum: {
              $cond: [{ $eq: ["$sentiment", "Negative"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const feedbackByClass = new Map(
      feedbackByClassRaw.map((item) => [
        classKey(item?._id?.year, item?._id?.department),
        item,
      ])
    );

    const classesToShow = classPairs.length
      ? classPairs
      : feedbackByClassRaw.map((item) => ({
          year: item?._id?.year || "",
          department: item?._id?.department || "",
        }));

    const highlights = await Promise.all(
      classesToShow.map(async (item, index) => {
        const classData =
          feedbackByClass.get(classKey(item.year, item.department)) || null;

        const counts = {
          positive: classData?.positive || 0,
          neutral: classData?.neutral || 0,
          negative: classData?.negative || 0,
        };
        const defaultType = classData ? "neutral" : "neutral";
        const type = classData
          ? ["positive", "neutral", "negative"].sort(
          (a, b) => counts[b] - counts[a]
        )[0]
          : defaultType;

        const allClassComments = (classData?.commentEntries || [])
          .map((entry) => entry?.text)
          .filter(Boolean);

        const summaryInput = buildSummaryInput(allClassComments);
        const summary = summaryInput ? await summarizeText(summaryInput) : "";
        const fallbackText =
          toConciseSentence(allClassComments[0]) ||
          classData?.sampleComment ||
          "No feedback submitted for this class yet.";

        return {
          id: index + 1,
          class: `${item.year || "-"} - ${item.department || "-"}`,
          type,
          title: classData ? titleByType[type] : "No Feedback Yet",
          text: summary || fallbackText,
        };
      })
    );

    res.json({
      metrics: {
        totalStudents,
        totalFeedback,
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
        notSubmitted,
      },
      monthlyTrend: formattedTrend,
      highlights,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Dashboard error" });
  }
});

module.exports = router;
