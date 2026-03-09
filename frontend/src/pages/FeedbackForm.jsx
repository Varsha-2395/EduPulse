import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import "../styles/feedbackForm.css";

const FeedbackForm = () => {

  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  const student = JSON.parse(localStorage.getItem("student"));
  const token = localStorage.getItem("token");

  const handleSessionExpired = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("token");
    alert("Session expired. Please login again.");
    navigate("/login");
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!student || !token) {
      handleSessionExpired();
      return;
    }

    if (!feedback.trim()) {
      alert("Feedback empty ??");
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

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            <Send size={16} />
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>

        </form>

        {showPopup && (
          <div className="popup-backdrop">
            <div className="success-popup">
              <h3>Feedback Submitted ????</h3>
              <p>Thank you for your feedback</p>
            </div>
          </div>
        )}

      </div>

    </div>

  );

};

export default FeedbackForm;
