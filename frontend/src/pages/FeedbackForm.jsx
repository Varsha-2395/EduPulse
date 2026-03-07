import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Send } from "lucide-react";
import "../styles/feedbackForm.css";

const FeedbackForm = () => {

  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Click voice input to start.");

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const navigate = useNavigate();

  const student = JSON.parse(localStorage.getItem("student"));
  const token = localStorage.getItem("token");

  const handleToggleListening = async () => {

    if (isListening && mediaRecorder) {
      mediaRecorder.stop();
      setIsListening(false);
      setVoiceStatus("Processing speech...");
      return;
    }

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);

      setMediaRecorder(recorder);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = async () => {

        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {

          const res = await fetch("http://localhost:5000/api/speech-to-text", {
            method: "POST",
            body: formData
          });

          const data = await res.json();

          if (data.text) {
            setFeedback((prev) => prev + " " + data.text);
          }

          setVoiceStatus("Speech converted successfully.");

        } catch (err) {

          console.log(err);
          setVoiceStatus("Speech processing failed.");

        }

      };

      recorder.start();

      setIsListening(true);
      setVoiceStatus("Recording... Speak now 🎤");

    } catch (error) {

      console.log(error);
      setVoiceStatus("Microphone access denied.");

    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!student || !token) {
      alert("Session expired 😏");
      return;
    }

    if (!feedback.trim()) {
      alert("Feedback empty 😏");
      return;
    }

    try {

      setIsSubmitting(true);

      const res = await fetch("http://localhost:5000/api/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          regNo: student.regNo,
          comments: feedback
        })
      });

      const data = await res.json();

      if (res.ok) {

        setFeedback("");
        setVoiceStatus("Click voice input to start.");
        setShowPopup(true);

        setTimeout(() => navigate(-1), 1500);

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
            className={`voice-box ${isListening ? "voice-box-listening" : ""}`}
            onClick={handleToggleListening}
            disabled={isSubmitting}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? "Stop recording" : "Use voice input"}
          </button>

          <p className="voice-status">{voiceStatus}</p>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <Send size={16} />
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>

        </form>

        {showPopup && (
          <div className="popup-backdrop">
            <div className="success-popup">
              <h3>Feedback Submitted 😌🔥</h3>
              <p>Thank you for your feedback</p>
            </div>
          </div>
        )}

      </div>

    </div>

  );

};

export default FeedbackForm;