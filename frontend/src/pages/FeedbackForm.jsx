import React, { useState } from "react";
import { Mic, Send } from "lucide-react";
import "../styles/feedbackForm.css";

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");
  
  const student = JSON.parse(localStorage.getItem("student"));
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!student || !token) {
      alert("Session expired 😏");
      return;
    }

    try {
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
        alert("Feedback submitted 😌🔥");
        setFeedback("");
      } else {
        alert(data.message || "Error");
      }

    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">

        {/* Header */}
        <div className="feedback-header">
          <h2>Submit Feedback</h2>
          <p>Your feedback helps improve academic quality</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label>Your Feedback</label>

          <textarea
            placeholder="Type your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />

          {/* Voice (UI only) */}
          <div className="voice-box">
            <Mic size={18} />
            <span>Give voice feedback</span>
          </div>

          <button type="submit" className="submit-btn">
            <Send size={16} /> Submit Feedback
          </button>
        </form>

      </div>
    </div>
  );
};

export default FeedbackForm;
