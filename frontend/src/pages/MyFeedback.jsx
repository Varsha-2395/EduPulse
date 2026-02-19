import React from "react";
import "../styles/myFeedback.css";

const MyFeedback = () => {
  // Dummy feedback data (backend later)
  const feedbackList = [
    {
      id: 1,
      date: "12 Feb 2026",
      content:
        "The teaching method is very effective and easy to understand.",
    },
    {
      id: 2,
      date: "25 Jan 2026",
      content:
        "More practical sessions would help in better understanding.",
    },
  ];

  return (
    <div className="myfb-container">
      <div className="myfb-card">

        {/* Header */}
        <div className="myfb-header">
          <h2>My Feedback</h2>
          <p>View your previously submitted feedback</p>
        </div>

        {/* Feedback list */}
        {feedbackList.map((item) => (
          <div key={item.id} className="feedback-item">
            <div className="feedback-top">
              <span className="date">{item.date}</span>
            </div>

            <p className="feedback-text">{item.content}</p>
          </div>
        ))}

        {/* Empty state */}
        {feedbackList.length === 0 && (
          <p className="empty-text">No feedback submitted yet.</p>
        )}

      </div>
    </div>
  );
};

export default MyFeedback;
