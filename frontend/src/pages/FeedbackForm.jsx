import { Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "../styles/feedbackForm.css";

const FeedbackForm = () => {

  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Click voice input to start.");

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [socket, setSocket] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const isRecordingRef = useRef(false);
  const streamRef = useRef(null);

  const navigate = useNavigate();

  const student = JSON.parse(localStorage.getItem("student"));
  const token = localStorage.getItem("token");

  // Initialize Socket.IO connection
  useEffect(() => {
    console.log("🌐 Initializing Socket.IO connection...");
    const socketConnection = io("http://localhost:5000");
    setSocket(socketConnection);

    // Socket event listeners
    socketConnection.on('connect', () => {
      console.log("✅ Socket.IO connected");
    });

    socketConnection.on('disconnect', () => {
      console.log("❌ Socket.IO disconnected");
    });

    socketConnection.on('recording-started', () => {
      console.log("🎬 Recording started event received");
      setVoiceStatus("Recording... Speak now.");
    });

    socketConnection.on('partial-transcript', (data) => {
      console.log("📝 Partial transcript received:", data);
      if (data.text && data.text !== '(processing...)') {
        setVoiceStatus(`Transcribing: "${data.text}"`);
      } else {
        setVoiceStatus("Processing speech...");
      }
    });

    socketConnection.on('final-transcript', (data) => {
      console.log("✅ Final transcript received:", data);
      if (data.text) {
        setFeedback((prev) => `${prev} ${data.text}`.trim());
        setVoiceStatus("Speech converted successfully.");
      }
    });

    socketConnection.on('recording-stopped', () => {
      console.log("🛑 Recording stopped event received");
      setVoiceStatus("Processing final speech...");
    });

    socketConnection.on('transcription-error', (data) => {
      console.error("💥 Transcription error received:", data);
      setVoiceStatus(data.error || "Speech processing failed.");
    });

    return () => {
      if (socketConnection) {
        console.log("🔌 Disconnecting Socket.IO...");
        socketConnection.disconnect();
      }
    };
  }, []);

  const handleSessionExpired = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");
    navigate("/login");
  };

  const handleToggleListening = async () => {
    if (isListening) {
      // Stop recording
      setIsListening(false);
      isRecordingRef.current = false;
      
      if (socket) {
        socket.emit('stop-recording');
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
      
      if (mediaRecorder) {
        if (mediaRecorder.disconnect) {
          mediaRecorder.disconnect();
        }
        setMediaRecorder(null);
      }
      
      return;
    }

    // Start recording
    if (!socket) {
      setVoiceStatus("Socket connection not ready. Please try again.");
      return;
    }

    try {
      console.log("🎤 Starting voice recording...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      streamRef.current = stream;
      setIsListening(true);
      isRecordingRef.current = true;

      // Create audio context for real-time processing
      const context = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      setAudioContext(context);

      // Resume audio context if suspended
      if (context.state === 'suspended') {
        await context.resume();
      }

      console.log("🔊 Audio context created, sample rate:", context.sampleRate);

      // Create audio processing pipeline
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(context.destination);

      // Start Socket.IO transcription session
      socket.emit('start-recording');
      console.log("📡 Started Socket.IO recording session");

      // Process audio data in real-time
      processor.onaudioprocess = (event) => {
        if (isRecordingRef.current && socket && socket.connected) {
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Convert float32 to int16
          const int16Data = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            int16Data[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)));
          }
          
          // Send audio data via Socket.IO
          socket.emit('audio-data', int16Data);
          console.log(`🎵 Sent audio chunk: ${int16Data.length} samples`);
        }
      };

      // Store processor for cleanup
      setMediaRecorder(processor);

    } catch (error) {
      console.error("Voice input error:", error);
      setIsListening(false);
      isRecordingRef.current = false;
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      
      setVoiceStatus("Microphone access denied or not available.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!student || !token) {
      handleSessionExpired();
      return;
    }

    if (!feedback.trim()) {
      alert("Feedback empty");
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
        if (res.status === 401) {
          handleSessionExpired();
          return;
        }
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
              <h3>Feedback Submitted</h3>
              <p>Thank you for your feedback</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
