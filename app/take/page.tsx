"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Department { id: string; name: string; }

export default function TakePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [form, setForm] = useState({ name: "", email: "", departmentId: "", grade: "" });
  const [loginEmail, setLoginEmail] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/take").then((r) => r.json()).then((d) => setDepartments(d.departments ?? []));
  }, []);

  function switchMode(m: "signup" | "login") {
    setMode(m);
    setError("");
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "login"
        ? { email: loginEmail, mode: "login" }
        : { ...form, mode: "signup" };
      const res = await fetch("/api/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Something went wrong."); return; }
      setOtpToken(data.token);
      setStep("otp");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/take/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, otp: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "Verification failed."); return; }

      const signInResult = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (signInResult?.error) { setError("Sign-in failed. Please try again."); return; }

      if (data.completed && data.resultId) {
        router.push(`/dashboard/report/${data.resultId}`);
      } else {
        router.push(`/dashboard/assessment/${data.assignmentId}`);
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleResend() {
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setStep("form");
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function handleOtpChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) { setOtp(text.split("")); otpRefs.current[5]?.focus(); e.preventDefault(); }
  }

  const activeEmail = mode === "login" ? loginEmail : form.email;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Leadership Operating Profile</h1>
          <p className="text-gray-500 mt-2 text-sm">40 questions · ~15 minutes · Confidential</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          {step === "form" && (
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => switchMode("signup")}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${mode === "signup" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                Sign Up
              </button>
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${mode === "login" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                Log In
              </button>
            </div>
          )}

          <div className="p-8">
            {step === "form" ? (
              <>
                {mode === "signup" ? (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Start your assessment</h2>
                    <p className="text-sm text-gray-500 mb-6">First time? Create your profile and we'll send a verification code.</p>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" required placeholder="e.g. Priya Sharma" value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Email <span className="text-red-500">*</span></label>
                        <input type="email" required placeholder="you@company.com" value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
                          <option value="">Select department</option>
                          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade / Level <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input type="text" placeholder="e.g. L4, Manager, VP" value={form.grade}
                          onChange={(e) => setForm({ ...form, grade: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                      <button type="submit" disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2">
                        {loading ? "Sending code…" : "Send Verification Code →"}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome back</h2>
                    <p className="text-sm text-gray-500 mb-6">Enter your work email and we'll send you a verification code to continue.</p>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Email <span className="text-red-500">*</span></label>
                        <input type="email" required placeholder="you@company.com" value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      </div>
                      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                      <button type="submit" disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2">
                        {loading ? "Sending code…" : "Send Verification Code →"}
                      </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      New here?{" "}
                      <button onClick={() => switchMode("signup")} className="text-indigo-600 font-medium hover:underline">Sign up instead</button>
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <button onClick={handleResend} className="text-sm text-indigo-600 hover:underline mb-4 flex items-center gap-1">← Back</button>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Check your email</h2>
                <p className="text-sm text-gray-500 mb-6">
                  We sent a 6-digit code to <strong>{activeEmail}</strong>. Enter it below to continue.
                </p>
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKey(i, e)}
                          className="w-11 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-3">Code expires in 10 minutes</p>
                  </div>
                  {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                  <button type="submit" disabled={loading || otp.join("").length < 6}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {loading ? "Verifying…" : "Verify & Continue →"}
                  </button>
                  <button type="button" onClick={handleResend} className="w-full text-sm text-gray-500 hover:text-gray-700">
                    Didn't receive it? Resend code
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your responses are confidential and used only for leadership development.
        </p>
      </div>
    </div>
  );
}
