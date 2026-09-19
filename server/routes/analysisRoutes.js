const express = require("express");

const { testAnalysis } = require("../controllers/analysisController");

const router = express.Router();

router.get("/test", testAnalysis);

module.exports = router;