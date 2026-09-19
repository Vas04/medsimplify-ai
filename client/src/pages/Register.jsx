import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Loader2, LockKeyhole, Mail, User } from "lucide-react";
import { register } from "../services/auth";
import { isDemoMode } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must contain at least 8 characters.");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to create account.");
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
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Your reports will be separated from other users.</p>
          {isDemoMode && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">Demo Mode is active. Registration creates a local demo session.</div>}
          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Name</span><div className="relative"><User className="absolute left-3 top-3.5 text-slate-400" size={18}/><input required minLength={2} value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500" placeholder="Your name"/></div></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Email</span><div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-400" size={18}/><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500" placeholder="you@example.com"/></div></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Password</span><div className="relative"><LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18}/><input type="password" required minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500" placeholder="At least 8 characters"/></div></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span><input type="password" required value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 px-4 outline-none focus:border-blue-500" placeholder="Repeat password"/></label>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading && <Loader2 size={17} className="animate-spin"/>} Create account</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-blue-600">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
