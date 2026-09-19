const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const { uploadReport } = require("../controllers/reportController");

const router = express.Router();

router.post("/upload", upload.single("report"), uploadReport);

module.exports = router;