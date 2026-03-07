const express = require("express");
const router = express.Router();
const multer = require("multer");

const { speechToText } = require("../controllers/speechController");

const upload = multer({ dest: "uploads/" });

router.post("/speech-to-text", upload.single("audio"), speechToText);

module.exports = router;