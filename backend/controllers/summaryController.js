const axios = require("axios");
const Feedback = require("../models/Feedback");

const getHfApiKey = () => String(process.env.HF_API_KEY || "").trim();
const HF_SUMMARY_MODEL =
  "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn";

exports.getSummary = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    const hfApiKey = getHfApiKey();
    if (!hfApiKey) {
      return res.status(500).json({ message: "HF_API_KEY missing" });
    }

    const text = feedbacks
      .map((feedback) => String(feedback.comments || "").trim())
      .filter(Boolean)
      .slice(0, 20)
      .join(". ");

    if (!text) {
      return res.json({ summary: "No feedback available." });
    }

    const response = await axios.post(
      HF_SUMMARY_MODEL,
      {
        inputs: `Summarize this feedback in one concise sentence: ${text}`,
        parameters: {
          max_length: 100,
          min_length: 12,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
        },
        timeout: 20000,
      }
    );

    const payload = response?.data;
    const summary = Array.isArray(payload)
      ? payload[0]?.summary_text || payload[0]?.generated_text || ""
      : payload?.summary_text || payload?.generated_text || "";

    res.json({ summary: summary || "Summary unavailable." });

  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "Summary failed"
    });
  }
};
