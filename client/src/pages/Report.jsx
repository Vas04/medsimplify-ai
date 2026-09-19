import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText,
  CalendarDays,
  Download,
  Loader2,
  Activity,
  ShieldCheck,
} from "lucide-react";
import jsPDF from "jspdf";
import api from "../services/api";

function StatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "WITHIN_RANGE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 size={14} />
        Within range
      </span>
    );
  }

  if (normalized === "OUTSIDE_RANGE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">
        <AlertCircle size={14} />
        Outside range
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      <Info size={14} />
      Information
    </span>
  );
}

function formatDate(date) {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getResultText(test) {
  if (
    test.display_value !== null &&
    test.display_value !== undefined &&
    String(test.display_value).trim() !== ""
  ) {
    return `${test.display_value}${
      test.unit ? ` ${test.unit}` : ""
    }`;
  }

  if (
    test.value !== null &&
    test.value !== undefined &&
    String(test.value).trim() !== ""
  ) {
    return `${test.value}${
      test.unit ? ` ${test.unit}` : ""
    }`;
  }

  return "Not available";
}

function getReferenceText(test) {
  if (test.reference_text) {
    return test.reference_text;
  }

  if (
    test.reference_min !== null &&
    test.reference_min !== undefined &&
    test.reference_max !== null &&
    test.reference_max !== undefined
  ) {
    return `${test.reference_min} - ${test.reference_max}${
      test.unit ? ` ${test.unit}` : ""
    }`;
  }

  if (
    test.reference_min !== null &&
    test.reference_min !== undefined
  ) {
    return `≥ ${test.reference_min}${
      test.unit ? ` ${test.unit}` : ""
    }`;
  }

  if (
    test.reference_max !== null &&
    test.reference_max !== undefined
  ) {
    return `≤ ${test.reference_max}${
      test.unit ? ` ${test.unit}` : ""
    }`;
  }

  return "Not provided";
}

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [tests, setTests] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const navigationData = location.state;

  const uploadData = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("latestReport")
      );
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      if (!id) {
        if (navigationData?.report || navigationData?.analysis) {
          setReport(navigationData.report || navigationData.analysis);
          setTests(navigationData.analysis?.tests || []);
          setSummary(navigationData.analysis?.summary || "");
        } else if (uploadData) {
          setReport(
            uploadData.report || uploadData
          );

          setTests(
            uploadData.analysis?.tests || []
          );

          setSummary(
            uploadData.analysis?.summary || ""
          );
        } else {
          navigate("/dashboard");
        }

        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          `/reports/${id}`
        );

        const data = response.data;

        setReport(data.report);
        setTests(data.tests || []);

        const stored =
          sessionStorage.getItem(
            `report-analysis-${id}`
          );

        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setSummary(parsed.summary || "");
          } catch {
            setSummary("");
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load this report."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id, navigate, navigationData, uploadData]);

  const stats = useMemo(() => {
    const within = tests.filter(
      (test) =>
        String(test.status).toUpperCase() ===
        "WITHIN_RANGE"
    ).length;

    const outside = tests.filter(
      (test) =>
        String(test.status).toUpperCase() ===
        "OUTSIDE_RANGE"
    ).length;

    const information = tests.filter(
      (test) =>
        !["WITHIN_RANGE", "OUTSIDE_RANGE"].includes(
          String(test.status).toUpperCase()
        )
    ).length;

    return {
      total: tests.length,
      within,
      outside,
      information,
    };
  }, [tests]);

  const downloadPDF = async () => {
    if (!report) return;

    try {
      setExporting(true);

      const doc = new jsPDF();

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      let y = 20;

      const safeName = String(
        report.file_name ||
          report.fileName ||
          "medical-report"
      )
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9-_]/gi, "-");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("MedSimplify AI", 20, y);

      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        "Medical Report Simplification",
        20,
        y
      );

      y += 12;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        report.file_name ||
          report.fileName ||
          "Medical Report",
        20,
        y
      );

      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(
        `Report type: ${
          report.report_type ||
          report.reportType ||
          "Medical Report"
        }`,
        20,
        y
      );

      y += 6;

      doc.text(
        `Date: ${formatDate(
          report.report_date ||
            report.reportDate
        )}`,
        20,
        y
      );

      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("AI Summary", 20, y);

      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const summaryText =
        summary ||
        "This report has been simplified into easy-to-understand information.";

      const summaryLines =
        doc.splitTextToSize(
          summaryText,
          pageWidth - 40
        );

      doc.text(summaryLines, 20, y);

      y +=
        summaryLines.length * 5 +
        10;

      tests.forEach((test, index) => {
        if (y > pageHeight - 55) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);

        doc.text(
          `${index + 1}. ${
            test.test_name ||
            test.testName ||
            "Test"
          }`,
          20,
          y
        );

        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text(
          `Result: ${getResultText(test)}`,
          20,
          y
        );

        y += 5;

        doc.text(
          `Reference: ${getReferenceText(test)}`,
          20,
          y
        );

        y += 5;

        const explanation =
          test.explanation ||
          "No explanation available.";

        const explanationLines =
          doc.splitTextToSize(
            explanation,
            pageWidth - 40
          );

        doc.text(
          explanationLines,
          20,
          y
        );

        y +=
          explanationLines.length * 4.5 +
          9;
      });

      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text(
        "Medical Information Notice",
        20,
        y
      );

      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      const disclaimer =
        "MedSimplify AI provides informational explanations based on the uploaded medical report. It does not provide medical diagnosis or treatment advice. Reference ranges may vary between laboratories.";

      const disclaimerLines =
        doc.splitTextToSize(
          disclaimer,
          pageWidth - 40
        );

      doc.text(
        disclaimerLines,
        20,
        y
      );

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let page = 1;
        page <= pageCount;
        page++
      ) {
        doc.setPage(page);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
          `MedSimplify AI • Page ${page} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          {
            align: "center",
          }
        );
      }

      doc.save(
        `${safeName}-simplified-report.pdf`
      );
    } catch (err) {
      console.error(
        "PDF export error:",
        err
      );

      alert(
        "Unable to generate the PDF."
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm font-medium text-slate-600">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 text-red-600"
              size={22}
            />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load report
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const fileName =
    report.file_name ||
    report.fileName ||
    "Medical Report";

  const reportType =
    report.report_type ||
    report.reportType ||
    "Medical Report";

  const reportDate =
    report.report_date ||
    report.reportDate;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">

      {/* Top navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <button
          onClick={downloadPDF}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Generating...
            </>
          ) : (
            <>
              <Download size={17} />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Header */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <FileText
                  size={27}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-blue-200">
                  Simplified Medical Report
                </p>

                <h1 className="mt-1 break-all text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {fileName}
                </h1>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    {reportType}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={15} />
                    {formatDate(reportDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck size={17} />
                AI analyzed
              </div>

              <p className="mt-1 text-xs text-slate-300">
                Results are explained in simple language.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
          <div className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Tests
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Within range
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {stats.within}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Outside range
            </p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {stats.outside}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Information
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-600">
              {stats.information}
            </p>
          </div>
        </div>
      </section>

      {/* AI Summary */}
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Activity size={21} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              AI Summary
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Your report in simple words
            </h2>

            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-700">
              {summary ||
                "This report has been simplified into easy-to-understand information."}
            </p>
          </div>
        </div>
      </section>

      {/* Test results */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Report details
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Test Results
            </h2>
          </div>

          <span className="text-sm text-slate-500">
            {tests.length} result
            {tests.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {tests.map((test, index) => {
            const status =
              String(
                test.status || ""
              ).toUpperCase();

            const isWithin =
              status === "WITHIN_RANGE";

            const isOutside =
              status === "OUTSIDE_RANGE";

            return (
              <article
                key={
                  test.id ||
                  `${test.test_name}-${index}`
                }
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                        {index + 1}
                      </span>

                      <h3 className="break-words text-base font-bold text-slate-900">
                        {test.test_name ||
                          test.testName ||
                          "Unknown Test"}
                      </h3>
                    </div>
                  </div>

                  <StatusBadge
                    status={test.status}
                  />
                </div>

                <div
                  className={`mt-4 rounded-2xl p-4 ${
                    isWithin
                      ? "bg-emerald-50"
                      : isOutside
                      ? "bg-red-50"
                      : "bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Result
                  </p>

                  <p
                    className={`mt-1 text-2xl font-bold ${
                      isWithin
                        ? "text-emerald-700"
                        : isOutside
                        ? "text-red-700"
                        : "text-slate-800"
                    }`}
                  >
                    {getResultText(test)}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Reference
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {getReferenceText(test)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <div className="mt-1">
                      <StatusBadge
                        status={test.status}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Easy explanation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {test.explanation ||
                      "No explanation available for this result."}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {tests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FileText
              size={32}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 font-semibold text-slate-700">
              No test results found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              No structured test results were extracted from this report.
            </p>
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <Info
            size={20}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <h3 className="font-bold text-amber-900">
              Medical Information Notice
            </h3>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              MedSimplify AI provides informational explanations based on
              the uploaded medical report. It does not provide medical
              diagnosis or treatment advice. Reference ranges may vary
              between laboratories. Consult a qualified healthcare
              professional for medical decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom action */}
      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
        <div>
          <p className="font-semibold text-slate-900">
            Need a copy of this report?
          </p>

          <p className="text-sm text-slate-500">
            Download the simplified report as a PDF.
          </p>
        </div>

        <button
          onClick={downloadPDF}
          disabled={exporting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
        >
          {exporting ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Generating...
            </>
          ) : (
            <>
              <Download size={17} />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}