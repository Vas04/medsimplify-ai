const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const Tesseract = require("tesseract.js");

const extractTextFromPDF = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
      data: fileBuffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text.trim();
  } catch (error) {
    console.error("PDF text extraction error:", error);

    throw new Error(
      "Failed to extract text from PDF."
    );
  }
};

const extractTextFromImage = async (filePath) => {
  try {
    console.log("Starting OCR for image...");

    const result = await Tesseract.recognize(
      filePath,
      "eng",
      {
        logger: (info) => {
          if (info.status === "recognizing text") {
            console.log(
              `OCR progress: ${Math.round(
                info.progress * 100
              )}%`
            );
          }
        },
      }
    );

    const text = result.data.text.trim();

    console.log("OCR completed.");

    return text;
  } catch (error) {
    console.error("Image OCR error:", error);

    throw new Error(
      "Failed to extract text from the image."
    );
  }
};

module.exports = {
  extractTextFromPDF,
  extractTextFromImage,
};