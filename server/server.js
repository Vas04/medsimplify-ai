const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");

const pool = require("./db/database");
const reportRoutes = require("./routes/reportRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/reports", reportRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MedSimplify AI API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      database: "Connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database health check error:", error);

    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Users query error:", error);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

// Get all reports
app.get("/api/reports", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id,
        r.file_name,
        r.report_type,
        r.report_date,
        r.created_at,
        COUNT(t.id) AS test_count
      FROM reports r
      LEFT JOIN test_results t
        ON r.id = t.report_id
      GROUP BY
        r.id,
        r.file_name,
        r.report_type,
        r.report_date,
        r.created_at
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      reports: result.rows,
    });
  } catch (error) {
    console.error("Reports query error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
});

// Get one complete report
app.get("/api/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const reportResult = await pool.query(
      `
      SELECT
        id,
        file_name,
        report_type,
        report_date,
        created_at
      FROM reports
      WHERE id = $1
      `,
      [id]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const testsResult = await pool.query(
      `
      SELECT
        id,
        test_name,
        value,
        display_value,
        unit,
        reference_min,
        reference_max,
        reference_text,
        status,
        explanation,
        created_at
      FROM test_results
      WHERE report_id = $1
      ORDER BY id
      `,
      [id]
    );

    res.json({
      success: true,
      report: reportResult.rows[0],
      tests: testsResult.rows,
    });
  } catch (error) {
    console.error("Single report query error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
    });
  }
});

// Delete report
app.delete("/api/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM reports
      WHERE id = $1
      RETURNING id, file_name
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    res.json({
      success: true,
      message: "Report deleted successfully.",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("Delete report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete report.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );

  console.log(
    process.env.GEMINI_API_KEY
      ? "Gemini API key loaded"
      : "WARNING: Gemini API key not loaded"
  );
});