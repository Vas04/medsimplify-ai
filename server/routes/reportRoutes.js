const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const { uploadReport } = require("../controllers/reportController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/upload", requireAuth, upload.single("report"), uploadReport);

module.exports = router;