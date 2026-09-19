import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { uploadReport } from "../services/api";

function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  const maxFileSize = 20 * 1024 * 1024;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Unsupported file type. Please upload a PDF, JPG, or PNG file."
      );

      e.target.value = "";
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setError(
        "File is too large. Please upload a file smaller than 20 MB."
      );

      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    if (uploading) return;

    setFile(null);
    setMessage("");
    setError("");
    setStage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || uploading) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      setStage("Uploading report...");

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      setStage(
        file.type === "application/pdf"
          ? "Extracting text from PDF..."
          : "Reading image with OCR..."
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setStage("Validating medical report...");

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setStage("Analyzing report with AI...");

      const result = await uploadReport(file);

      console.log("Upload result:", result);

      if (result.success && result.analysis) {
        setStage("Report analysis completed.");

        await new Promise((resolve) =>
          setTimeout(resolve, 400)
        );

        navigate("/report", {
          state: {
            analysis: result.analysis,
            report: result.report,
          },
        });

        return;
      }

      setError(
        result.message ||
          "The report could not be processed."
      );
    } catch (error) {
      console.error("Upload error:", error);

      const serverMessage =
        error.response?.data?.message;

      const serverReason =
        error.response?.data?.reason;

      if (
        error.response?.data?.rejected
      ) {
        setError(
          serverReason
            ? `${serverMessage} ${serverReason}`
            : serverMessage ||
                "This document does not appear to be a medical report."
        );
      } else if (serverMessage) {
        setError(serverMessage);
      } else if (error.code === "ERR_NETWORK") {
        setError(
          "Unable to connect to the server. Make sure the backend is running on port 5000."
        );
      } else {
        setError(
          "Something went wrong while processing the report. Please try again."
        );
      }

      setStage("");
    } finally {
      setUploading(false);
    }
  };

  const getFileTypeLabel = () => {
    if (!file) return "";

    if (file.type === "application/pdf") {
      return "PDF document";
    }

    if (file.type === "image/jpeg") {
      return "JPEG image";
    }

    if (file.type === "image/png") {
      return "PNG image";
    }

    return "File";
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">
          Upload Medical Report
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Upload a medical report to extract and simplify
          important information.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {!file ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-16 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UploadCloud size={28} />
              </div>

              <h2 className="text-lg font-semibold text-slate-900">
                Upload your medical report
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Click to select a PDF, JPG, or PNG file
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Maximum file size: 20 MB
              </p>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              {/* File */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <FileText size={24} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {file.name}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>
                        {getFileTypeLabel()}
                      </span>

                      <span>
                        {(file.size / 1024 / 1024).toFixed(
                          2
                        )}{" "}
                        MB
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={uploading}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Processing */}
              {uploading && (
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Loader2
                      size={20}
                      className="mt-0.5 shrink-0 animate-spin text-blue-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Processing your report
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        {stage}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-blue-600">
                        Please keep this page open while the
                        report is being processed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && !uploading && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Unable to process report
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Button */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Processing Report...
                  </>
                ) : (
                  <>
                    <UploadCloud size={17} />
                    Analyze Report
                  </>
                )}
              </button>

              {message && !uploading && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />

                    <p className="text-sm font-medium text-emerald-700">
                      {message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Information */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-semibold text-slate-700">
                Important:
              </span>{" "}
              Only medical reports are accepted. PDF, JPG and
              PNG files up to 20 MB are supported. Scanned
              images are processed using OCR. Non-medical
              documents are automatically rejected.
              MedSimplify AI provides informational
              explanations and does not provide medical
              diagnosis or treatment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;