const express = require("express");
const pool = require("../db/database");

const router = express.Router();

// Get all test results grouped by test name
router.get("/tests", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tr.test_name,
        tr.value,
        tr.display_value,
        tr.unit,
        tr.reference_min,
        tr.reference_max,
        tr.reference_text,
        tr.status,
        r.id AS report_id,
        r.file_name,
        r.report_date,
        r.created_at
      FROM test_results tr
      INNER JOIN reports r
        ON tr.report_id = r.id
      ORDER BY
        tr.test_name ASC,
        COALESCE(r.report_date, r.created_at) ASC
    `);

    res.json({
      success: true,
      tests: result.rows,
    });
  } catch (error) {
    console.error("History tests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch test history.",
    });
  }
});

// Get available test names
router.get("/test-names", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT test_name
      FROM test_results
      ORDER BY test_name ASC
    `);

    res.json({
      success: true,
      testNames: result.rows.map((row) => row.test_name),
    });
  } catch (error) {
    console.error("Test names error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch test names.",
    });
  }
});

module.exports = router;