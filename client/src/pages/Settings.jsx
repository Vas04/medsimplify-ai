import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Languages,
  ShieldCheck,
  Database,
  Info,
  Save,
} from "lucide-react";

export default function Settings() {
  const [language, setLanguage] = useState("English");
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(
      "medsimplifySettings",
      JSON.stringify({
        language,
        showDisclaimer,
        autoSave,
      })
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <SettingsIcon size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Settings
            </h1>
            <p className="text-sm text-slate-500">
              Manage your MedSimplify AI preferences
            </p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <User size={20} className="text-slate-700" />

          <div>
            <h2 className="font-semibold text-slate-900">
              Profile
            </h2>
            <p className="text-sm text-slate-500">
              Your basic account information
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Name
            </label>

            <input
              value="Demo User"
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Email
            </label>

            <input
              value="demo@medsimplify.ai"
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Languages size={20} className="text-slate-700" />

          <div>
            <h2 className="font-semibold text-slate-900">
              Preferences
            </h2>
            <p className="text-sm text-slate-500">
              Customize how MedSimplify AI behaves
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* Language */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-800">
                Explanation language
              </p>
              <p className="text-sm text-slate-500">
                Language used for simplified explanations
              </p>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option>English</option>
              <option>Kannada</option>
              <option>Hindi</option>
            </select>
          </div>

          {/* Disclaimer */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <div>
              <p className="font-medium text-slate-800">
                Show medical disclaimer
              </p>
              <p className="text-sm text-slate-500">
                Display the safety disclaimer on report pages
              </p>
            </div>

            <button
              onClick={() => setShowDisclaimer(!showDisclaimer)}
              className={`relative h-6 w-11 rounded-full transition ${
                showDisclaimer ? "bg-slate-900" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  showDisclaimer ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Auto save */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <div>
              <p className="font-medium text-slate-800">
                Auto-save reports
              </p>
              <p className="text-sm text-slate-500">
                Automatically save analyzed reports to history
              </p>
            </div>

            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative h-6 w-11 rounded-full transition ${
                autoSave ? "bg-slate-900" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  autoSave ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Database size={20} className="text-slate-700" />

          <div>
            <h2 className="font-semibold text-slate-900">
              Data
            </h2>
            <p className="text-sm text-slate-500">
              Manage your stored report information
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="font-medium text-slate-800">
            Report history
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Your uploaded reports and analyzed test results are stored
            securely in the application database.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 text-slate-700" />

          <div>
            <h2 className="font-semibold text-slate-900">
              About MedSimplify AI
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              MedSimplify AI helps users understand medical reports using
              OCR and artificial intelligence. It provides simplified
              explanations for informational purposes only.
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Version 1.0 • Hackathon Edition
            </p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm font-medium text-green-600">
            Settings saved
          </span>
        )}

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {/* Safety */}
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={20} />

        <p className="text-sm leading-6 text-blue-800">
          MedSimplify AI provides informational explanations and does not
          diagnose medical conditions or recommend treatments.
        </p>
      </div>
    </div>
  );
}