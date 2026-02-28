import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Send } from "lucide-react";
import "../styles/feedbackForm.css";

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceError, setVoiceError] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("Click voice input to start.");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const shouldKeepListeningRef = useRef(false);
  const userStoppedRef = useRef(false);

  const navigate = useNavigate();

  const student = JSON.parse(localStorage.getItem("student"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceError("");
      setVoiceStatus("Mic active. Speak now...");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimTranscript = "";
      let allFinalForPreview = "";

      for (let i = 0; i < event.results.length; i += 1) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          allFinalForPreview += `${transcriptPart} `;
        } else {
          interimTranscript += `${transcriptPart} `;
        }
      }

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalChunk += `${event.results[i][0].transcript} `;
        }
      }

      if (finalChunk.trim()) {
        setFeedback((prev) =>
          `${prev}${prev.trim() ? " " : ""}${finalChunk.trim()}`
        );
      }

      finalTranscriptRef.current = allFinalForPreview.trim();
      const previewText = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
      setLiveTranscript(previewText);
      setVoiceStatus("Receiving speech...");
    };

    recognition.onerror = (event) => {
      setVoiceError(`Voice input error: ${event.error}`);
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed" ||
        event.error === "audio-capture"
      ) {
        shouldKeepListeningRef.current = false;
        setIsListening(false);
        setVoiceStatus("Mic access failed. Check browser mic settings.");
        return;
      }

      if (event.error === "no-speech") {
        setVoiceStatus("No speech detected. Keep speaking...");
        return;
      }

      setVoiceStatus("Voice interrupted. Reconnecting...");
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current && !userStoppedRef.current) {
        try {
          setVoiceStatus("Reconnecting mic...");
          recognition.start();
          return;
        } catch (error) {
          setVoiceError("Unable to restart voice input.");
        }
      }
      setIsListening(false);
      setVoiceStatus("Voice input stopped.");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechSupported(false);
      return;
    }

    if (isListening) {
      userStoppedRef.current = true;
      shouldKeepListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      setLiveTranscript("");
      finalTranscriptRef.current = "";
      setVoiceStatus("Voice input stopped.");
      return;
    }

    setVoiceError("");
    setLiveTranscript("");
    finalTranscriptRef.current = "";
    userStoppedRef.current = false;
    shouldKeepListeningRef.current = true;
    setVoiceStatus("Starting voice input...");
    try {
      recognitionRef.current.start();
    } catch (error) {
      shouldKeepListeningRef.current = false;
      setVoiceError("Unable to start voice input.");
      setVoiceStatus("Voice input could not start.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isListening && recognitionRef.current) {
      userStoppedRef.current = true;
      shouldKeepListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      setLiveTranscript("");
      finalTranscriptRef.current = "";
      setVoiceStatus("Voice input stopped.");
    }

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          regNo: student.regNo,
          comments: feedback,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback("");
        setLiveTranscript("");
        finalTranscriptRef.current = "";
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

          {speechSupported && (
            <button
              type="button"
              className={`voice-box ${isListening ? "voice-box-listening" : ""}`}
              onClick={handleToggleListening}
              disabled={isSubmitting}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? "Stop voice input" : "Use voice input"}
            </button>
          )}

          {!speechSupported && (
            <p className="voice-error">Speech-to-text is not supported in this browser.</p>
          )}

          {voiceError && <p className="voice-error">{voiceError}</p>}

          <p className="voice-status">{voiceStatus}</p>

          {liveTranscript && (
            <div className="voice-preview">
              <p>{liveTranscript}</p>
            </div>
          )}

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
