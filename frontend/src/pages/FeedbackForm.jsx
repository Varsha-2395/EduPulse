import React, { useState } from "react";
import { Mic, Send } from "lucide-react";
import "../styles/feedbackForm.css";

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // backend later
    setFeedback("");
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
