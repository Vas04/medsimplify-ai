import { ArrowRight, FileText, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FileText size={21} />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              MedSimplify<span className="text-blue-600"> AI</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Features
            </a>

            <a
              href="#how"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              How it works
            </a>

            <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Enter App
            </button>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-20 lg:grid-cols-2 lg:pt-28">

          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Sparkles size={16} />
              AI-powered report simplification
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
              Understand your medical reports
              <span className="text-blue-600"> without the jargon.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Upload a medical report and turn complex results into a clear,
              structured explanation. Track selected values across your
              previous reports in one place.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                Analyze a Report
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <button className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-100">
                See how it works
              </button>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Informational use only. MedSimplify AI does not provide medical
              diagnosis.
            </p>
          </div>

          {/* Right Preview */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-blue-100/50 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60">

              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Report Analysis
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    Blood Test Report
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Analyzed
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Summary
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The report contains 14 identified test results. Values are
                  organized with their reported reference ranges for easier
                  understanding.
                </p>
              </div>

              <div className="mt-5 space-y-3">

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Hemoglobin
                    </p>
                    <p className="text-xs text-slate-500">
                      Reference range available
                    </p>
                  </div>

                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    13.8 g/dL
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Glucose
                    </p>
                    <p className="text-xs text-slate-500">
                      Compare with reference range
                    </p>
                  </div>

                  <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                    108 mg/dL
                  </span>
                </div>

              </div>

            </div>
          </div>

        </section>

        {/* Features */}
        <section
          id="features"
          className="border-y border-slate-200 bg-white"
        >
          <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-3">

            <div className="border-b border-slate-200 p-8 md:border-b-0 md:border-r">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={21} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Extract
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Convert uploaded medical documents into structured report
                information.
              </p>
            </div>

            <div className="border-b border-slate-200 p-8 md:border-b-0 md:border-r">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Sparkles size={21} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Simplify
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Turn technical report information into easier-to-understand
                language.
              </p>
            </div>

            <div className="p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp size={21} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                Track
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Compare selected test values across your previous reports.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 py-8 text-center">
        <p className="text-sm text-slate-400">
          © 2026 MedSimplify AI · Informational use only
        </p>
      </footer>

    </div>
  );
}

export default Landing;