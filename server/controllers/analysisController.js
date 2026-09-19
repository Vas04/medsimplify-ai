const { analyzeMedicalReport } = require("../services/aiService");

const testAnalysis = async (req, res) => {
  try {
    const sampleText = `
    Complete Blood Count

    Hemoglobin: 13.5 g/dL
    Reference Range: 12.0 - 16.0 g/dL

    WBC Count: 7200 cells/uL
    Reference Range: 4000 - 11000 cells/uL

    Platelet Count: 250000 /uL
    Reference Range: 150000 - 450000 /uL
    `;

    const result = await analyzeMedicalReport(sampleText);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini analysis error:", error);

    res.status(500).json({
      success: false,
      message: "Gemini analysis failed.",
      error: error.message,
    });
  }
};

module.exports = {
  testAnalysis,
};