const nodemailer = require("nodemailer");
const Student = require("../models/Student");
const MonthlyReminderLog = require("../models/MonthlyReminderLog");

const CHECK_INTERVAL_MS = 60 * 60 * 1000;

let timer = null;
let isRunning = false;

const isLastDayOfMonth = (date = new Date()) => {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  return tomorrow.getMonth() !== date.getMonth();
};

const monthKeyFromDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const normalizeEmail = (student = {}) =>
  String(student.email || student.emailId || student.mail || "")
    .trim()
    .toLowerCase();

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createTransporter = () => {
  const user = String(process.env.MAIL_USER || "").trim();
  const pass = String(process.env.MAIL_PASS || "").trim();

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const sendMonthlyFeedbackReminder = async () => {
  const now = new Date();
  if (!isLastDayOfMonth(now)) return;

  const monthKey = monthKeyFromDate(now);
  const alreadySent = await MonthlyReminderLog.findOne({ monthKey }).lean();
  if (alreadySent) return;

  const transporter = createTransporter();
  if (!transporter) {
    console.log("Monthly reminder skipped: MAIL_USER / MAIL_PASS missing");
    return;
  }

  const feedbackUrl =
    String(process.env.FEEDBACK_FORM_URL || "").trim() || "http://localhost:5173/feedback";
  const students = await Student.find().select("name email emailId mail").lean();

  const recipients = [
    ...new Set(students.map(normalizeEmail).filter((email) => isValidEmail(email))),
  ];

  if (!recipients.length) {
    await MonthlyReminderLog.create({
      monthKey,
      status: "skipped",
      recipientCount: 0,
      note: "No valid student emails found",
    });
    console.log(`Monthly reminder skipped for ${monthKey}: no recipients`);
    return;
  }

  const mailOptions = {
    from: String(process.env.MAIL_USER || "").trim(),
    bcc: recipients.join(","),
    subject: "EduPulse Feedback Reminder - Please Submit Today",
    text: `Please submit your monthly feedback using this link: ${feedbackUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
        <h2 style="margin-bottom:8px;">EduPulse Monthly Feedback Reminder</h2>
        <p style="margin-top:0;">Today is the last day of this month. Please fill your feedback form.</p>
        <p>
          <a href="${feedbackUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;">
            Open Feedback Form
          </a>
        </p>
        <p>Link: <a href="${feedbackUrl}">${feedbackUrl}</a></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);

  await MonthlyReminderLog.create({
    monthKey,
    status: "sent",
    recipientCount: recipients.length,
    note: "Monthly feedback reminder delivered",
  });

  console.log(`Monthly feedback reminder sent for ${monthKey} to ${recipients.length} students`);
};

const runJob = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    await sendMonthlyFeedbackReminder();
  } catch (error) {
    console.log("Monthly reminder job error:", error.message);
  } finally {
    isRunning = false;
  }
};

const startMonthlyFeedbackReminderJob = () => {
  if (timer) return;
  runJob();
  timer = setInterval(runJob, CHECK_INTERVAL_MS);
};

module.exports = { startMonthlyFeedbackReminderJob };
