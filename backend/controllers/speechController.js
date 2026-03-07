const axios = require("axios");
const fs = require("fs");

const API_KEY = process.env.ASSEMBLYAI_API_KEY;

exports.speechToText = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "No audio uploaded" });
    }

    const audioPath = req.file.path;

    const audioData = fs.readFileSync(audioPath);

    const uploadRes = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      audioData,
      {
        headers: {
          authorization: API_KEY,
          "content-type": "application/octet-stream"
        },
        maxBodyLength: Infinity
      }
    );

    const audioUrl = uploadRes.data.upload_url;

    const transcriptRes = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: audioUrl },
      {
        headers: {
          authorization: API_KEY,
          "content-type": "application/json"
        }
      }
    );

    const transcriptId = transcriptRes.data.id;

    let text = "";

    while (true) {

      const polling = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { authorization: API_KEY }
        }
      );

      if (polling.data.status === "completed") {
        text = polling.data.text;
        break;
      }

      if (polling.data.status === "error") {
        throw new Error("Transcription failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    fs.unlinkSync(audioPath);

    res.json({ text });

  } catch (error) {

    console.log("Speech API error:", error.response?.data || error.message);

    res.status(500).json({
      message: "Speech processing failed"
    });

  }
};