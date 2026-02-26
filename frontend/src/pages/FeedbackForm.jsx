import React, { useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import "../styles/feedbackForm.css";

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const student = JSON.parse(localStorage.getItem("student"));
  const token = localStorage.getItem("token");

  const sendToWhisper = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      console.log("🎤 Blob Size:", audioBlob.size);
      console.log("🎧 Audio URL:", URL.createObjectURL(audioBlob));
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("language", "en");

      const res = await fetch("http://127.0.0.1:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.text) {
        setFeedback((prev) => `${prev} ${data.text}`.trim());
        setVoiceStatus("Voice converted to text");
      } else {
        setVoiceStatus(data.error || "Voice transcription failed");
      }
    } catch (error) {
      console.log(error);
      setVoiceStatus("Whisper server not reachable");
    }
  };

  const handleVoice = async () => {
    if (!isRecording) {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
          setVoiceStatus("Voice recording not supported in this browser");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          setVoiceStatus("Processing voice...");
          await sendToWhisper();
        };

        mediaRecorder.start();
        setIsRecording(true);
        setVoiceStatus("Recording...");
      } catch (error) {
        console.log(error);
        setVoiceStatus("Mic permission denied");
      }
      return;
    }

    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!student || !token) {
      alert("Session expired");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          regNo: student.regNo,
          comments: feedback,
          subject: "General",
          faculty: "Faculty",
          rating: 5,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Feedback submitted");
        setFeedback("");
      } else {
        alert(data.message || "Error");
      }
    } catch (error) {
      console.log(error);
      alert("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <h2>Submit Feedback</h2>
          <p>Your feedback helps improve academic quality</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Your Feedback</label>

          <textarea
            placeholder="Type your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />

          <button
            type="button"
            className={`voice-box ${isRecording ? "voice-box-listening" : ""}`}
            onClick={handleVoice}
          >
            <Mic size={18} />
            <span>{isRecording ? "Stop Recording" : "Give voice feedback"}</span>
          </button>

          {voiceStatus && <p className="voice-status">{voiceStatus}</p>}

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <Send size={16} /> Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
