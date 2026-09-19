import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  CalendarDays,
  ArrowRight,
  Loader2,
  History as HistoryIcon,
  TrendingUp,
  BarChart3,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

function History() {
  const [reports, setReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [testNames, setTestNames] = useState([]);

  const [selectedTest, setSelectedTest] = useState("");

  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setComparisonLoading(true);
        setError("");

        const [
          reportsResponse,
          testsResponse,
          namesResponse,
        ] = await Promise.all([
          api.get("/reports"),
          api.get("/history/tests"),
          api.get("/history/test-names"),
        ]);

        const reportData =
          reportsResponse.data.reports || [];

        const testData =
          testsResponse.data.tests || [];

        const names =
          namesResponse.data.testNames || [];

        setReports(reportData);
        setTests(testData);
        setTestNames(names);

        if (names.length > 0) {
          setSelectedTest(names[0]);
        }
      } catch (err) {
        console.error("History loading error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load report history."
        );
      } finally {
        setLoading(false);
        setComparisonLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (reportId, fileName) => {
    const confirmed = window.confirm(
      `Delete "${fileName}"?\n\nThis will permanently remove the report and its test results.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(reportId);

      await api.delete(`/reports/${reportId}`);

      setReports((currentReports) =>
        currentReports.filter(
          (report) => report.id !== reportId
        )
      );

      setTests((currentTests) =>
        currentTests.filter(
          (test) => test.report_id !== reportId
        )
      );
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete the report."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const chartData = useMemo(() => {
    if (!selectedTest) return [];

    return tests
      .filter(
        (test) =>
          test.test_name === selectedTest &&
          test.value !== null &&
          test.value !== undefined
      )
      .map((test) => ({
        date: formatDate(
          test.report_date || test.created_at
        ),
        value: Number(test.value),
        displayValue:
          test.display_value ??
          String(test.value),
        unit: test.unit || "",
        report: test.file_name,
      }));
  }, [tests, selectedTest]);

  const selectedTestData = tests.filter(
    (test) =>
      test.test_name === selectedTest
  );

  const latestValue =
    chartData.length > 0
      ? chartData[chartData.length - 1]
      : null;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">
          Medical Records
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Report History
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review previous reports and compare test results over time.
        </p>
      </div>

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading your reports...
            </p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Uploaded Reports
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your saved medical reports.
                </p>
              </div>

              <Link
                to="/upload"
                className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:block"
              >
                Upload Report
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="p-10 text-center">
                <HistoryIcon
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-semibold text-slate-900">
                  No reports yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Upload a medical report to start building your history.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {report.file_name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>
                            {report.report_type ||
                              "Medical Report"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} />

                            {formatDate(
                              report.report_date ||
                                report.created_at
                            )}
                          </span>

                          <span>
                            {report.test_count}{" "}
                            {Number(report.test_count) === 1
                              ? "test"
                              : "tests"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        to={`/report/${report.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        View Report
                        <ArrowRight size={15} />
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            report.id,
                            report.file_name
                          )
                        }
                        disabled={
                          deletingId === report.id
                        }
                        title="Delete report"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === report.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Test History Comparison
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Compare the same test across available reports.
                  </p>
                </div>
              </div>
            </div>

            {comparisonLoading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <Loader2
                  size={28}
                  className="animate-spin text-blue-600"
                />
              </div>
            ) : testNames.length === 0 ? (
              <div className="p-10 text-center">
                <TrendingUp
                  size={40}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No test history available
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="max-w-xl">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select a test
                  </label>

                  <select
                    value={selectedTest}
                    onChange={(e) =>
                      setSelectedTest(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {testNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {latestValue && (
                  <div className="mt-6 rounded-xl bg-slate-50 p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Latest recorded result
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <p className="text-3xl font-bold text-slate-900">
                        {latestValue.displayValue}
                      </p>

                      <p className="mb-1 text-sm font-medium text-slate-500">
                        {latestValue.unit}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {latestValue.date}
                    </p>
                  </div>
                )}

                {chartData.length >= 2 ? (
                  <div className="mt-8 h-[320px] w-full">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                        />

                        <YAxis
                          tick={{ fontSize: 12 }}
                        />

                        <Tooltip
                          content={({ active, payload }) => {
                            if (
                              !active ||
                              !payload ||
                              !payload.length
                            ) {
                              return null;
                            }

                            const data =
                              payload[0].payload;

                            return (
                              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                                <p className="text-xs text-slate-400">
                                  {data.date}
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                  {data.displayValue}{" "}
                                  {data.unit}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {data.report}
                                </p>
                              </div>
                            );
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="value"
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <TrendingUp
                      size={32}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Not enough numeric history
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      At least two recorded numeric results are needed
                      to display a comparison chart.
                    </p>
                  </div>
                )}

                {selectedTestData.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Recorded Results
                    </h3>

                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                      <div className="divide-y divide-slate-100">
                        {selectedTestData.map(
                          (test, index) => (
                            <div
                              key={`${test.report_id}-${index}`}
                              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {formatDate(
                                    test.report_date ||
                                      test.created_at
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {test.file_name}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-sm font-bold text-slate-900">
                                  {test.display_value ??
                                    test.value ??
                                    "—"}{" "}
                                  {test.unit || ""}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {test.status ===
                                  "WITHIN_RANGE"
                                    ? "Within range"
                                    : test.status ===
                                        "OUTSIDE_RANGE"
                                      ? "Outside range"
                                      : "Information"}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default History;