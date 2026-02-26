import React, { useEffect, useState } from "react";
import "../styles/myFeedback.css";

const MyFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);

  const student = JSON.parse(localStorage.getItem("student"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!student || !token) return;

    const fetchFeedback = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/feedback/student/${student.regNo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setFeedbackList(data);
        }

      } catch (error) {
        console.log(error);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="myfb-container">
      <div className="myfb-card">

        <div className="myfb-header">
          <h2>My Feedback</h2>
          <p>View your previously submitted feedback</p>
        </div>

        {feedbackList.map((item) => (
          <div key={item._id} className="feedback-item">
            <div className="feedback-top">
              <span className="date">
                {new Date(item.createdAt).toLocaleDateString()} 😌
              </span>
            </div>

            <p className="feedback-text">{item.comments}</p>
          </div>
        ))}

        {feedbackList.length === 0 && (
          <p className="empty-text">No feedback submitted yet.</p>
        )}

      </div>
    </div>
  );
};

export default MyFeedback;