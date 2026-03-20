const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Student = require("../models/Student");
const MonthlyReminderLog = require("../models/MonthlyReminderLog");

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const TEST_REMINDER_AT = new Date("2026-03-20T14:00:00+05:30");
const TEST_REMINDER_LOG_KEY = "2026-03-20-1400-manual-test";
const TEST_STUDENT_NAMES = ["varsha v s", "sharam riya a", "thibisha", "varun","barath r p"];

let timer = null;
let isRunning = false;
let testTimer = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
const normalizeName = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

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

const sendMonthlyFeedbackReminder = async ({ force = false, customLogKey = null } = {}) => {
  const now = new Date();
  if (!force && !isLastDayOfMonth(now)) return;

  const monthKey = monthKeyFromDate(now);
  const logKey = customLogKey || (force ? `${monthKey}-manual-${now.getTime()}` : monthKey);
  const alreadySent = await MonthlyReminderLog.findOne({ monthKey: logKey }).lean();
  if (alreadySent) return;

  const transporter = createTransporter();
  if (!transporter) {
    console.log("Monthly reminder skipped: MAIL_USER / MAIL_PASS missing");
    return {
      monthKey,
      recipientCount: 0,
      forced: force,
      status: "skipped",
      note: "MAIL_USER / MAIL_PASS missing",
    };
  }

  const feedbackUrl =
    String(process.env.FEEDBACK_FORM_URL || "").trim() || "http://localhost:5173/feedback";
  const senderEmail = String(process.env.MAIL_USER || "").trim();
  const students = await Student.find().select("name email emailId mail").lean();
  const filteredStudents = students.filter((student) =>
    TEST_STUDENT_NAMES.includes(normalizeName(student.name))
  );

  const recipients = [
    ...new Set(filteredStudents.map(normalizeEmail).filter((email) => isValidEmail(email))),
  ];

  if (!recipients.length) {
    await MonthlyReminderLog.create({
      monthKey: logKey,
      status: "skipped",
      recipientCount: 0,
      note: force ? "Manual test skipped: no valid student emails found" : "No valid student emails found",
    });
    console.log(
      `Monthly reminder skipped for ${force ? `${monthKey} (manual test)` : monthKey}: no recipients for ${TEST_STUDENT_NAMES.join(", ")}`
    );
    return {
      monthKey,
      recipientCount: 0,
      forced: force,
      status: "skipped",
      note: "No valid student emails found",
    };
  }

  console.log(
    `Monthly reminder test recipients: ${filteredStudents.map((student) => student.name).join(", ")}`
  );

  const logoPath = path.resolve(__dirname, "../../frontend/public/edupulse-logo.png");
  const hasLogo = fs.existsSync(logoPath);
  const reminderHtml = `
    <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#1d4ed8,#2563eb);text-align:center;">
          ${
            hasLogo
              ? '<img src="cid:edupulse-logo" alt="EduPulse" style="height:52px;object-fit:contain;background:#fff;padding:6px 10px;border-radius:10px;" />'
              : '<h1 style="margin:0;color:#ffffff;font-size:24px;">EduPulse</h1>'
          }
          <p style="margin:10px 0 0;color:#dbeafe;font-size:13px;">Monthly Feedback Reminder</p>
        </div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;color:#111827;font-size:22px;">Please submit your monthly feedback today</h2>
          <p style="margin:0 0 14px;color:#4b5563;font-size:14px;line-height:1.7;">
            This is a reminder from EduPulse to complete your feedback form for this month. Your feedback helps us understand student experience, identify concerns early, and improve academic support.
          </p>
          <p style="margin:0 0 14px;color:#4b5563;font-size:14px;line-height:1.7;">
            Please take a minute to open the form and submit your response. If you have already completed it, you can ignore this email.
          </p>
          <div style="margin:18px 0;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;text-align:center;">
            <a href="${feedbackUrl}" style="display:inline-block;padding:12px 20px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
              Open Feedback Form
            </a>
            <p style="margin:12px 0 0;color:#1e40af;font-size:13px;word-break:break-all;">${feedbackUrl}</p>
          </div>
          <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
            If the button does not work, copy and open the link above in your browser.
          </p>
          <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated email from EduPulse.</p>
        </div>
      </div>
    </div>
  `;

  const baseMailOptions = {
    from: senderEmail,
    subject: "EduPulse Feedback Reminder - Please Submit Today",
    text:
      `EduPulse Monthly Feedback Reminder\n\n` +
      `Please submit your monthly feedback today using the link below:\n` +
      `${feedbackUrl}\n\n` +
      `Your feedback helps us improve the student experience. If you have already submitted it, you can ignore this email.\n\n` +
      `This is an automated email from EduPulse.`,
    html: reminderHtml,
  };

  if (hasLogo) {
    baseMailOptions.attachments = [
      {
        filename: "edupulse-logo.png",
        path: logoPath,
        cid: "edupulse-logo",
      },
    ];
  }

  let deliveredCount = 0;
  const failedRecipients = [];
  for (const recipient of recipients) {
    try {
      await transporter.sendMail({
        ...baseMailOptions,
        to: recipient,
      });
      deliveredCount += 1;
    } catch (error) {
      failedRecipients.push({
        recipient,
        message: error?.response || error?.message || "Unknown mail error",
      });
      console.log(`Monthly reminder failed for ${recipient}: ${error?.response || error?.message}`);
    }
    await sleep(400);
  }

  if (!deliveredCount) {
    throw new Error(
      failedRecipients[0]?.message || "All monthly reminder emails were rejected"
    );
  }

  await MonthlyReminderLog.create({
    monthKey: logKey,
    status: "sent",
    recipientCount: deliveredCount,
    note:
      failedRecipients.length > 0
        ? `Delivered to ${deliveredCount}, failed for ${failedRecipients.length}`
        : force
          ? "Manual test reminder delivered"
          : "Monthly feedback reminder delivered",
  });

  console.log(
    `Monthly feedback reminder sent for ${force ? `${monthKey} (manual test)` : monthKey} to ${deliveredCount} students`
  );

  return {
    monthKey,
    recipientCount: deliveredCount,
    forced: force,
    status: "sent",
    note:
      failedRecipients.length > 0
        ? `Delivered to ${deliveredCount}, failed for ${failedRecipients.length}`
        : force
          ? "Manual test reminder delivered"
          : "Monthly feedback reminder delivered",
  };
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

const scheduleTodayNoonTestReminder = () => {
  if (testTimer) return;

  const delay = TEST_REMINDER_AT.getTime() - Date.now();
  if (delay <= 0) {
    console.log(`Timed test reminder target ${TEST_REMINDER_AT.toString()} already passed. Triggering immediately.`);
    testTimer = setTimeout(async () => {
      try {
        await sendMonthlyFeedbackReminder({
          force: true,
          customLogKey: TEST_REMINDER_LOG_KEY,
        });
      } catch (error) {
        console.log("Timed test reminder error:", error.message);
      } finally {
        testTimer = null;
      }
    }, 1000);
    return;
  }

  testTimer = setTimeout(async () => {
    try {
      await sendMonthlyFeedbackReminder({
        force: true,
        customLogKey: TEST_REMINDER_LOG_KEY,
      });
    } catch (error) {
      console.log("Timed test reminder error:", error.message);
    } finally {
      testTimer = null;
    }
  }, delay);

  console.log(`Timed test reminder scheduled for ${TEST_REMINDER_AT.toString()}`);
};

module.exports = {
  startMonthlyFeedbackReminderJob,
  sendMonthlyFeedbackReminder,
  scheduleTodayNoonTestReminder,
};
