const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;

exports.analyzeSentiment = async (req, res) => {

  try {

    const { text } = req.body;

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      {
        inputs: text
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`
        }
      }
    );
    console.log("HF Response:", response.data);

    res.json(response.data);

  } catch (error) {

    console.log("Sentiment API error:", error.response?.data || error.message);

    res.status(500).json({
      message: "Sentiment analysis failed"
    });

  }

};
