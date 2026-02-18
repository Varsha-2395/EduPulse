import { Routes, Route, Navigate } from "react-router-dom";
import StudentLogin from "./pages/StudentLogin";
import RegisterStudentID from "./pages/RegisterStudentID";
import VerifyOTP from "./pages/VerifyOTP";
import SetPassword from "./pages/SetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import FeedbackForm from "./pages/FeedbackForm";
import MyFeedback from "./pages/MyFeedback";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Feedbacks from "./pages/Feedbacks";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/register" element={<RegisterStudentID />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/feedback" element={<FeedbackForm />} />
      <Route path="/my-feedback" element={<MyFeedback />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/feedbacks" element={<Feedbacks />} />
    </Routes>
  );
}

export default App;
