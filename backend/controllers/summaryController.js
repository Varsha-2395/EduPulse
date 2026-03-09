const axios = require("axios");
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

const getFeedbackSummary = async (req, res) => {
  try {
    if (Date.now() < geminiQuotaBlockedUntil) {
      return res.status(429).json({ message: "Gemini quota temporarily exceeded. Try again shortly." });
    }

    const geminiApiKey = getGeminiApiKey();
    if (!geminiApiKey) {
      return res.status(500).json({ message: "GEMINI_API_KEY missing" });
    }

    const feedbacks = await Feedback.find();

    if (feedbacks.length === 0) {
      return res.json({ summary: "No feedback available" });
    }

    const comments = feedbacks.map(f => f.comments).join(". ");

    const preferredModel = getGeminiModel();
    const modelsToTry = [
      ...(preferredModel ? [preferredModel] : []),
      ...GEMINI_MODEL_CANDIDATES,
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    let summary = "";

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
                      text: `Summarize the following feedback in one concise sentence:\n${comments}`,
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
            }
          );

          summary = (response?.data?.candidates || [])
            .flatMap((c) => c?.content?.parts || [])
            .map((p) => p?.text || "")
            .join(" ")
            .trim();

          if (summary) break;
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
            return res.status(429).json({ message: `Gemini quota exceeded. Retry in ${Math.ceil(retryMs / 1000)}s.` });
          }
          const isModelNotFound = String(message).toLowerCase().includes("not found");
          if (!isModelNotFound) {
            console.log("Summary Gemini API error:", message);
            return res.status(500).json({ message: "Failed to generate summary" });
          }
        }
      }
      if (summary) break;
    }

    if (!summary) {
      return res.status(500).json({ message: "No compatible Gemini model found" });
    }

    res.json({ summary });

  } catch (error) {

    console.log(
      "Summary Gemini API error:",
      error.response?.data?.error?.message || error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to generate summary"
    });

  }
};

module.exports = { getFeedbackSummary };
