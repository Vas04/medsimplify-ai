const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey,
});

const models = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
];

const validateMedicalReport = async (reportText) => {
  const prompt = `
Determine whether the following document is a medical or healthcare report.

A valid medical report may contain things such as:
- Blood test results
- CBC
- Lipid profile
- Liver function test
- Kidney function test
- Thyroid test
- Urine test
- Imaging report
- Radiology report
- Pathology report
- Health checkup report
- Laboratory test results
- Other clinical laboratory measurements

Documents such as:
- School/college documents
- Resumes
- Invoices
- Bills
- Bank statements
- Newspapers
- Books
- General articles
- Normal text documents
- Random PDFs
must be rejected.

Return ONLY valid JSON:

{
  "isMedicalReport": true or false,
  "reason": "short explanation"
}

Document:

${reportText}
`;

  let lastError;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      return JSON.parse(response.text);
    } catch (error) {
      lastError = error;

      console.error(
        `Medical report validation failed with ${model}:`,
        error.message
      );

      if (
        error.message.includes("503") ||
        error.message.includes("UNAVAILABLE") ||
        error.message.includes("high demand")
      ) {
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

module.exports = {
  validateMedicalReport,
};