import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  UploadCloud,
  Activity,
  CalendarDays,
  ArrowRight,
  Loader2,
  Clock3,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isThisMonth = (date) => {
    if (!date) return false;

    const reportDate = new Date(date);
    const now = new Date();

    return (
      reportDate.getMonth() === now.getMonth() &&
      reportDate.getFullYear() === now.getFullYear()
    );
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const response = await api.get("/reports");

        setReports(response.data.reports || []);
      } catch (error) {
        console.error(
          "Dashboard reports error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const totalReports = reports.length;

  const totalTests = reports.reduce(
    (total, report) =>
      total + Number(report.test_count || 0),
    0
  );

  const reportsThisMonth = useMemo(() => {
    return reports.filter((report) =>
      isThisMonth(
        report.report_date || report.created_at
      )
    ).length;
  }, [reports]);

  const latestReport = reports[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Health Report Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Understand your medical reports through clear,
          structured and plain-language explanations.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Reports */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Reports
              </p>

              {loading ? (
                <Loader2
                  size={22}
                  className="mt-4 animate-spin text-blue-600"
                />
              ) : (
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {totalReports}
                </p>
              )}
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={21} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Saved medical reports
          </p>
        </div>

        {/* Total Tests */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Tests Processed
              </p>

              {loading ? (
                <Loader2
                  size={22}
                  className="mt-4 animate-spin text-emerald-600"
                />
              ) : (
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {totalTests}
                </p>
              )}
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Activity size={21} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Measurements extracted
          </p>
        </div>

        {/* This Month */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Reports This Month
              </p>

              {loading ? (
                <Loader2
                  size={22}
                  className="mt-4 animate-spin text-violet-600"
                />
              ) : (
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {reportsThisMonth}
                </p>
              )}
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BarChart3 size={21} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Uploaded this month
          </p>
        </div>

        {/* Latest Report */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Latest Report
              </p>

              {loading ? (
                <Loader2
                  size={22}
                  className="mt-4 animate-spin text-amber-600"
                />
              ) : latestReport ? (
                <>
                  <p className="mt-3 truncate text-lg font-bold text-slate-900">
                    {latestReport.file_name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(
                      latestReport.report_date ||
                        latestReport.created_at
                    )}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-lg font-semibold text-slate-400">
                  No reports
                </p>
              )}
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Upload */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <UploadCloud size={23} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Simplify a new medical report
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Upload a PDF, JPG or PNG medical report and
                get important results explained in plain
                language.
              </p>
            </div>
          </div>

          <Link
            to="/upload"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            <UploadCloud size={17} />
            Upload Report
          </Link>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <div className="flex items-center gap-2">
              <Clock3
                size={18}
                className="text-slate-500"
              />

              <h2 className="font-semibold text-slate-900">
                Recent Reports
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Your latest uploaded medical reports.
            </p>
          </div>

          <Link
            to="/history"
            className="hidden items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700 sm:flex"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading reports...
              </p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText size={26} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No reports uploaded yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Upload your first medical report to start
              building your report history.
            </p>

            <Link
              to="/upload"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <UploadCloud size={16} />
              Upload First Report
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {report.file_name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span>
                        {report.report_type ||
                          "Medical Report"}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={12} />

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

                <Link
                  to={`/report/${report.id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  View Report
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 p-4 sm:hidden">
          <Link
            to="/history"
            className="flex items-center justify-center gap-1 text-sm font-medium text-blue-600"
          >
            View all reports
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Information Notice */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-700">
            Medical information:
          </span>{" "}
          MedSimplify AI provides informational explanations
          of uploaded reports. It does not provide medical
          diagnosis or treatment advice. Always consult a
          qualified healthcare professional for medical
          decisions.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;