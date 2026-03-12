const axios = require("axios");

const getAssemblyApiKey = () => String(process.env.ASSEMBLYAI_API_KEY || "").trim();

const pollTranscript = async (transcriptId, apiKey) => {
  while (true) {
    const polling = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      { headers: { authorization: apiKey } }
    );

    if (polling.data.status === "completed") {
      return polling.data;
    }

    if (polling.data.status === "error") {
      throw new Error(polling.data.error || "Transcription failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
};

exports.speechToText = async (req, res) => {
  try {
    const apiKey = getAssemblyApiKey();
    if (!apiKey) {
      return res.status(500).json({ message: "ASSEMBLYAI_API_KEY missing" });
    }

    if (!req.file || !req.file.buffer?.length) {
      return res.status(400).json({ message: "No audio uploaded" });
    }

    const uploadRes = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      req.file.buffer,
      {
        headers: {
          authorization: apiKey,
          "content-type": req.file.mimetype || "application/octet-stream",
        },
        maxBodyLength: Infinity,
      }
    );

    const transcriptRes = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: uploadRes.data.upload_url,
        language_detection: true,
        speech_models: ["universal-2"],
      },
      {
        headers: {
          authorization: apiKey,
          "content-type": "application/json",
        },
      }
    );

    const completed = await pollTranscript(transcriptRes.data.id, apiKey);
    return res.json({
      provider: "AssemblyAI",
      text: completed.text || "",
      confidence: completed.confidence || 0,
      language: completed.language_code || "",
    });
  } catch (error) {
    console.log("Speech API error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Speech processing failed" });
  }
};
