const Feedback = require("../models/Feedback");
const axios = require("axios");

const getHfApiKey = () => String(process.env.HF_API_KEY || "").trim();

const submitFeedback = async (req, res) => {
  try {

    const { comments } = req.body;
    const hfApiKey = getHfApiKey();
    if (!hfApiKey) {
      return res.status(500).json({ error: "HF_API_KEY missing" });
    }

    let sentimentResult = "Neutral";

    // HuggingFace sentiment API
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      { inputs: comments },
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
        },
      }
    );

    const label = response.data[0][0].label;

    if (label === "POSITIVE" || label === "LABEL_2") sentimentResult = "Positive";
    if (label === "NEUTRAL" || label === "LABEL_1") sentimentResult = "Neutral";
    if (label === "NEGATIVE" || label === "LABEL_0") sentimentResult = "Negative";

    // save feedback with sentiment
    const feedback = new Feedback({
      ...req.body,
      sentiment: sentimentResult,
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted 😌🔥",
      feedback,
    });

  } catch (err) {

    console.log("Sentiment API error:", err.response?.data || err.message);

    res.status(500).json({ error: err.message });
  }
};

const getStudentFeedback = async (req, res) => {
  try {

    const { regNo } = req.params;
    const feedbacks = await Feedback.find({ regNo });

    res.json(feedbacks);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {

    const feedbacks = await Feedback.find();
    res.json(feedbacks);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  submitFeedback,
  getStudentFeedback,
  getAllFeedback,
};
