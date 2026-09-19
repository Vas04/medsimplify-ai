const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const message = String(error?.message || "").toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("high demand") ||
    message.includes("rate limit") ||
    message.includes("429")
  );
};

const extractJSON = (text) => {
  if (!text) {
    throw new Error("Empty AI response.");
  }

  let cleaned = text.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonText = cleaned.slice(
        firstBrace,
        lastBrace + 1
      );

      return JSON.parse(jsonText);
    }

    throw new Error("AI returned invalid JSON.");
  }
};

const normalizeStatus = (status) => {
  const normalized = String(status || "")
    .trim()
    .toUpperCase();

  if (normalized === "WITHIN_RANGE") {
    return "WITHIN_RANGE";
  }

  if (normalized === "OUTSIDE_RANGE") {
    return "OUTSIDE_RANGE";
  }

  return "INFORMATION_ONLY";
};

const normalizeNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  if (!cleaned) {
    return null;
  }

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
};

const normalizeAnalysis = (analysis) => {
  if (!analysis || typeof analysis !== "object") {
    throw new Error("Invalid AI analysis.");
  }

  const tests = Array.isArray(analysis.tests)
    ? analysis.tests
    : [];

  return {
    reportType:
      analysis.reportType ||
      "Medical Report",

    reportDate:
      analysis.reportDate || null,

    summary:
      analysis.summary ||
      "This report has been simplified into easy-to-understand information.",

    tests: tests.map((test) => {
      const displayValue =
        test.displayValue !== undefined &&
        test.displayValue !== null &&
        String(test.displayValue).trim() !== ""
          ? String(test.displayValue).trim()
          : test.value !== undefined &&
            test.value !== null
          ? String(test.value)
          : null;

      return {
        testName:
          test.testName ||
          "Unknown Test",

        value:
          normalizeNumber(test.value),

        displayValue,

        unit:
          test.unit ||
          null,

        referenceMin:
          normalizeNumber(
            test.referenceMin
          ),

        referenceMax:
          normalizeNumber(
            test.referenceMax
          ),

        referenceText:
          test.referenceText ||
          null,

        status:
          normalizeStatus(test.status),

        explanation:
          test.explanation ||
          "This test result has been extracted from the report.",
      };
    }),
  };
};

const createPrompt = (medicalText) => {
  return `
You are MedSimplify AI, an AI system that explains medical reports in very simple language.

Your MAIN PURPOSE is:

"Take a medical report and explain it so that an ordinary person with no medical background can easily understand it."

Do NOT make a diagnosis.
Do NOT recommend medicines.
Do NOT recommend treatment.
Do NOT give medical advice.
Do NOT predict diseases.
Do NOT tell the patient what they should do medically.

You are ONLY explaining information already present in the report.

-----------------------------------
REPORT
-----------------------------------

${medicalText}

-----------------------------------
EXTRACTION RULES
-----------------------------------

Extract the important medical tests/results from the report.

For every test identify:

- testName
- value
- displayValue
- unit
- referenceMin
- referenceMax
- referenceText
- status
- explanation

Preserve the actual result from the report.

If the report contains:

<1.00

then displayValue should remain:

"<1.00"

Do not convert it into 1.00.

If the report contains:

>40

then preserve:

">40"

If the report contains:

140/90 mmHg

then:

displayValue = "140/90"
value = null
unit = "mmHg"

Do not incorrectly convert blood pressure into a single number.

If the report contains a decimal comma such as:

36,8

then:

displayValue = "36,8"
value = 36.8

-----------------------------------
MISSING RESULTS
-----------------------------------

If the report mentions a test but the actual result is missing, pending, blank, or not yet available:

value = null

displayValue = "Not available"

status = "INFORMATION_ONLY"

Do NOT invent a value.

-----------------------------------
STATUS RULES
-----------------------------------

Use ONLY these statuses:

WITHIN_RANGE
OUTSIDE_RANGE
INFORMATION_ONLY

If the report provides a normal reference range and the numerical result can clearly be compared with it:

Use WITHIN_RANGE when the result is inside the provided range.

Use OUTSIDE_RANGE when the result is clearly outside the provided range.

If there is not enough information to determine this:

Use INFORMATION_ONLY.

IMPORTANT:

A reference such as:

<200

does NOT automatically mean the result is abnormal.

A reference such as:

>40

does NOT automatically mean the result is abnormal.

If the actual result is missing, use INFORMATION_ONLY.

The report's own reference range has priority over general ranges.

-----------------------------------
COMMON ADULT VITAL SIGN RANGES
-----------------------------------

Only use these general ranges when the report does NOT provide its own reference range and the test is clearly one of these common adult measurements:

Pulse / Heart Rate:
60–100 bpm

Respiratory Rate:
12–20 breaths/min

Body Temperature:
approximately 36.1–37.2 °C

Oxygen Saturation / SpO2:
95–100%

Do NOT invent general reference ranges for specialized tests.

For tests such as Troponin-I, Apo B, hsCRP, hormones, specialized cardiac markers, etc., use the report's own reference range when available.

If no reliable range is available:

status = INFORMATION_ONLY

-----------------------------------
MOST IMPORTANT:
EASY HUMAN EXPLANATIONS
-----------------------------------

The explanation is the MOST IMPORTANT part of this task.

Write every explanation for an ordinary person.

The user should understand:

1. What this test checks.
2. What their result is, when available.
3. Whether it is within/outside the provided reference range, when this can be determined.

Use very simple English.

Avoid technical laboratory language.

DO NOT simply repeat the test name.

DO NOT simply repeat the reference range.

DO NOT copy sentences from the original report.

DO NOT write like a laboratory report.

Keep each explanation to approximately 1–2 short sentences.

-----------------------------------
GOOD EXAMPLES
-----------------------------------

Example 1:

Test:
Apolipoprotein B

Result:
46 mg/dL

Reference:
46 - 174

Good explanation:

"Apo B is a protein that helps carry cholesterol in the blood. Your result is 46 mg/dL, which is within the range given in the report."

-----------------------------------

Example 2:

Test:
Fasting Glucose

Result:
92 mg/dL

Reference:
70 - 100

Good explanation:

"Fasting glucose shows the amount of sugar in your blood after fasting. Your result is 92 mg/dL, which is within the range given in the report."

-----------------------------------

Example 3:

Test:
HbA1c

Result:
Not available

Good explanation:

"HbA1c shows your average blood sugar level over roughly the past 2–3 months. The result is not available in this report."

-----------------------------------

Example 4:

Test:
HDL Cholesterol

Result:
55 mg/dL

Reference:
>40

Good explanation:

"HDL is a type of cholesterol often called 'good cholesterol'. Your result is 55 mg/dL, and the report gives above 40 mg/dL as the reference."

-----------------------------------

Example 5:

Test:
hsCRP

Result:
<1.00 mg/L

Reference:
<1.00

Good explanation:

"hsCRP measures a protein related to inflammation in the body. Your report shows a result below 1.00 mg/L."

-----------------------------------

Example 6:

Test:
Troponin-I

Result:
4 ng/L

No reference range

Good explanation:

"Troponin-I is a blood test that measures a protein associated with heart muscle cells. Your reported result is 4 ng/L, but this report does not provide a reference range for comparison."

-----------------------------------

Example 7:

Test:
Temperature

Result:
37.0 °C

Good explanation:

"Body temperature shows how warm your body is. Your recorded temperature is 37.0 °C, which is within the usual adult range."

-----------------------------------

Example 8:

Test:
Total Cholesterol

Result:
Not available

Reference:
<200 mg/dL

Good explanation:

"Total cholesterol measures the amount of cholesterol in your blood. The result is not available in this report yet."

-----------------------------------

BAD EXPLANATIONS — DO NOT USE
-----------------------------------

Do NOT write:

"Value is within the stated reference interval."

Do NOT write:

"The analyte is reported with a threshold of <1.00 mg/L."

Do NOT write:

"The result was evaluated against risk stratification cut-offs."

Do NOT write:

"Laboratory parameters indicate..."

Do NOT write:

"The patient's biochemical profile demonstrates..."

These are too technical.

Instead, explain the test in normal everyday language.

-----------------------------------
SUMMARY RULES
-----------------------------------

Create a short AI summary.

The summary should be easy to understand.

Do not diagnose the patient.

Do not say the patient has a disease.

Do not provide treatment advice.

A good summary can say:

"This report contains blood tests related to cholesterol, blood sugar, inflammation, and heart-related markers. Some results are available, while some results are still missing from the report."

The summary should generally be 1–3 simple sentences.

-----------------------------------
OUTPUT FORMAT
-----------------------------------

Return ONLY valid JSON.

Do not include markdown.

Do not include \`\`\`json.

Use exactly this structure:

{
  "reportType": "string",
  "reportDate": "YYYY-MM-DD or null",
  "summary": "simple 1-3 sentence explanation",
  "tests": [
    {
      "testName": "string",
      "value": number or null,
      "displayValue": "string or null",
      "unit": "string or null",
      "referenceMin": number or null,
      "referenceMax": number or null,
      "referenceText": "string or null",
      "status": "WITHIN_RANGE | OUTSIDE_RANGE | INFORMATION_ONLY",
      "explanation": "very simple 1-2 sentence explanation"
    }
  ]
}

IMPORTANT FINAL RULE:

The output should feel like:

"Someone has taken this complicated medical report and explained it to me in simple English."

It should NOT feel like:

"Another medical laboratory report."
`;
};

const analyzeWithModel = async (
  model,
  medicalText
) => {
  const prompt = createPrompt(medicalText);

  const response = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const text =
    response?.text ||
    response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  const parsed = extractJSON(text);

  return normalizeAnalysis(parsed);
};

const analyzeMedicalReport = async (
  medicalText
) => {
  if (
    !medicalText ||
    typeof medicalText !== "string"
  ) {
    throw new Error(
      "Medical report text is empty."
    );
  }

  let lastError = null;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];

    try {
      console.log(
        `Trying Gemini model: ${model}`
      );

      const result =
        await analyzeWithModel(
          model,
          medicalText
        );

      console.log(
        `Gemini analysis successful using ${model}`
      );

      return result;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini model ${model} failed:`,
        error.message
      );

      if (!isRetryableError(error)) {
        throw error;
      }

      if (i < MODELS.length - 1) {
        console.log(
          "Retrying with another Gemini model..."
        );

        await sleep(500);
      }
    }
  }

  throw new Error(
    `All Gemini models failed. ${
      lastError?.message || ""
    }`
  );
};

module.exports = {
  analyzeMedicalReport,
};