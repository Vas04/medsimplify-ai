import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText, Loader2, LockKeyhole, Mail } from "lucide-react";
import { login } from "../services/auth";
import { isDemoMode } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(isDemoMode ? "demo@medsimplify.ai" : "");
  const [password, setPassword] = useState(isDemoMode ? "demo1234" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><FileText size={20} /></span>
          MedSimplify<span className="text-blue-600"> AI</span>
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to access your medical reports.</p>

          {isDemoMode && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              Demo login: <strong>demo@medsimplify.ai</strong> / <strong>demo1234</strong>
            </div>
          )}

          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="you@example.com" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Your password" />
              </div>
            </label>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {loading && <Loader2 size={17} className="animate-spin" />} Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Create one</Link>
          </p>
          <Link to="/" className="mt-4 block text-center text-sm text-slate-400 hover:text-slate-600">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
