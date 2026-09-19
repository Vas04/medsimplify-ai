const {
  extractTextFromPDF,
  extractTextFromImage,
} = require("../services/ocrService");

const { analyzeMedicalReport } = require("../services/aiService");

const {
  validateMedicalReport,
} = require("../services/reportValidator");

const pool = require("../db/database");

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No report file uploaded.",
      });
    }

    let extractedText = "";

    // Extract text from PDF
    if (req.file.mimetype === "application/pdf") {
      console.log("Extracting text from PDF...");

      extractedText = await extractTextFromPDF(
        req.file.path
      );
    }

    // Extract text from JPG/PNG using OCR
    else if (
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/png"
    ) {
      console.log(
        "Extracting text from image using OCR..."
      );

      extractedText = await extractTextFromImage(
        req.file.path
      );
    }

    // Clean extracted text
    extractedText = extractedText
      ? extractedText.replace(/\s+/g, " ").trim()
      : "";

    console.log(
      `Extracted text length: ${extractedText.length} characters`
    );

    // Reject empty documents
    if (!extractedText) {
      return res.status(400).json({
        success: false,
        rejected: true,
        message:
          "The uploaded report appears to be empty or unreadable.",
        reason:
          "No readable text could be extracted from this file.",
      });
    }

    // Reject extremely small OCR results
    if (extractedText.length < 30) {
      return res.status(400).json({
        success: false,
        rejected: true,
        message:
          "The report image may be blurry, cropped, or unreadable. Please upload a clearer report.",
        reason:
          "Only a very small amount of readable text was detected.",
      });
    }

    // Validate medical document
    console.log("Validating document...");

    const validation =
      await validateMedicalReport(extractedText);

    console.log(
      "Medical report validation:",
      validation
    );

    if (!validation.isMedicalReport) {
      return res.status(400).json({
        success: false,
        rejected: true,
        message:
          "This document does not appear to be a medical report.",
        reason: validation.reason,
      });
    }

    // Analyze using AI
    console.log("Analyzing medical report...");

    const analysis =
      await analyzeMedicalReport(extractedText);

    console.log(
      "Medical report analysis completed."
    );

    // Validate AI response
    if (!analysis || typeof analysis !== "object") {
      return res.status(500).json({
        success: false,
        message:
          "The AI analysis could not be completed.",
      });
    }

    if (!Array.isArray(analysis.tests)) {
      analysis.tests = [];
    }

    // Save report
    const reportResult = await pool.query(
      `
      INSERT INTO reports
      (
        user_id,
        file_name,
        report_type,
        report_date,
        extracted_text
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
          req.user.sub,
          req.file.originalname,
        analysis.reportType || null,
        analysis.reportDate || null,
        extractedText,
      ]
    );

    const report = reportResult.rows[0];

    console.log(
      `Report saved with ID: ${report.id}`
    );

    // Save test results
    for (const test of analysis.tests) {
      await pool.query(
        `
        INSERT INTO test_results
        (
          report_id,
          test_name,
          value,
          display_value,
          unit,
          reference_min,
          reference_max,
          reference_text,
          status,
          explanation
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
        `,
        [
          report.id,
          test.testName || "Unknown Test",
          test.value ?? null,
          test.displayValue || null,
          test.unit || null,
          test.referenceMin ?? null,
          test.referenceMax ?? null,
          test.referenceText || null,
          test.status || "INFORMATION_ONLY",
          test.explanation || null,
        ]
      );
    }

    console.log(
      `${analysis.tests.length} test results saved.`
    );

    return res.status(200).json({
      success: true,
      rejected: false,
      message:
        "Medical report uploaded, analyzed, and saved successfully.",

      report: {
        id: report.id,
        fileName: report.file_name,
        reportType: report.report_type,
        reportDate: report.report_date,
      },

      analysis,
    });
  } catch (error) {
    console.error(
      "Report processing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process the medical report. Please try again.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  uploadReport,
};