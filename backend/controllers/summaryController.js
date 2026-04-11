const axios = require("axios");
const Feedback = require("../models/Feedback");

const getHfApiKey = () => String(process.env.HF_API_KEY || "").trim();
const HF_SUMMARY_MODEL = process.env.HF_SUMMARY_MODEL || 
  "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn";
const SUMMARY_PROMPT = process.env.SUMMARY_PROMPT || 
  "Summarize this feedback in one concise sentence:";
const MAX_FEEDBACK_LIMIT = parseInt(process.env.MAX_FEEDBACK_LIMIT) || 20;

// Utility function to extract year number for sorting
const extractYearNumber = (yearStr) => {
  const match = String(yearStr || "").match(/(\d+)/);
  return match ? parseInt(match[1]) : 999; // Default to 999 for unknown years
};

// Utility function to sort department+year groups
const sortGroups = (groups) => {
  return groups.sort((a, b) => {
    // First sort by department (alphabetical)
    const deptCompare = (a.department || "").localeCompare(b.department || "");
    if (deptCompare !== 0) return deptCompare;
    
    // Then sort by year (numerical)
    return extractYearNumber(a.year) - extractYearNumber(b.year);
  });
};

exports.getSummary = async (req, res) => {
  try {
    const hfApiKey = getHfApiKey();
    if (!hfApiKey) {
      return res.status(500).json({ message: "HF_API_KEY missing" });
    }

    // Get all unique department+year combinations
    const groups = await Feedback.aggregate([
      {
        $group: {
          _id: {
            department: "$department",
            year: "$year"
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          department: "$_id.department",
          year: "$_id.year",
          count: 1,
          _id: 0
        }
      }
    ]);

    if (!groups.length) {
      return res.json({ summaries: [] });
    }

    // Sort groups by department then year
    const sortedGroups = sortGroups(groups);
    const summaries = [];

    // Process each group
    for (const group of sortedGroups) {
      const groupName = `${group.department} ${group.year}`;
      
      try {
        // Get feedbacks for this specific group
        const feedbacks = await Feedback.find({
          department: group.department,
          year: group.year
        });

        const text = feedbacks
          .map(feedback => String(feedback.comments || "").trim())
          .filter(Boolean)
          .slice(0, MAX_FEEDBACK_LIMIT)
          .join(". ");

        let summary = "";
        if (text) {
          const response = await axios.post(
            HF_SUMMARY_MODEL,
            {
              inputs: `${SUMMARY_PROMPT} ${text}`,
              parameters: {
                max_length: 100,
                min_length: 12,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${hfApiKey}`,
              },
              timeout: 20000,
            }
          );

          const payload = response?.data;
          summary = Array.isArray(payload)
            ? payload[0]?.summary_text || payload[0]?.generated_text || ""
            : payload?.summary_text || payload?.generated_text || "";
        }

        summaries.push({
          group: groupName,
          department: group.department,
          year: group.year,
          feedbackCount: feedbacks.length,
          summary: summary || `No feedback available for ${groupName}.`,
          status: "completed"
        });

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (groupError) {
        console.log(`Group summary error for ${groupName}:`, groupError.message);
        
        summaries.push({
          group: groupName,
          department: group.department,
          year: group.year,
          feedbackCount: 0,
          summary: `Failed to generate summary for ${groupName}.`,
          status: "failed",
          error: groupError.message
        });
      }
    }

    res.json({ summaries });

  } catch (error) {
    console.log("Summary generation error:", error.response?.data || error.message);

    res.status(500).json({
      message: "Failed to generate summary. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
