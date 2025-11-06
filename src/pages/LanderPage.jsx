import React, { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../auth/api";
import { useAuthContext } from "../auth/AuthContext";
import { BASE_URL } from "../utils/AppConstant";
import bg from "../assets/bg.jpg";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LanderPage = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const isLogin = useMemo(() => mode === "login", [mode]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const resetFormFields = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
  };

  const switchMode = (nextMode, options = {}) => {
    if (mode === nextMode && !options.force) return;
    resetFormFields();
    setFormError("");
    setFormSuccess(options.successMessage || "");
    setMode(nextMode);
  };

  // ---------------------------
  // LOGIN HANDLER
  // ---------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFormError("Enter both email and password to continue.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setFormError("");
      setFormSuccess("");

      const res = await api.post("login/", {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      login(res.data.access, res.data.refresh);
      navigate("/dashboard");
    } catch (err) {
      const fallbackMessage =
        "We could not sign you in. Please check your credentials and try again.";
      const apiMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        fallbackMessage;
      setFormError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // REGISTER HANDLER (UPDATED)
  // ---------------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      setFormError("Fill out every field to create an account.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setFormError("Password must include at least 6 characters.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setFormError("");
      setFormSuccess("");

      // ✅ Send register request
      await api.post(`${BASE_URL}register/`, {
        username: trimmedName,
        password: trimmedPassword,
        email: trimmedEmail,
      });

      // ✅ Switch to login with success message
      switchMode("login", {
        force: true,
        successMessage: "Account created successfully. Sign in to continue.",
      });
    } catch (err) {
      const fallbackMessage =
        "We could not complete your registration. Please try again.";
      const apiMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        fallbackMessage;

      setFormError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const formBaseClass =
    "absolute inset-0 w-full transition-all duration-500 ease-in-out transform";

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 bg-black/5"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-1 shadow-xl">
        <div className="rounded-[1.35rem] bg-white p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-sm text-slate-500">
                {isLogin
                  ? "Sign in to continue to your Sarala Engineering workspace."
                  : "Register to access the Sarala Engineering platform."}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isLogin
                    ? "bg-[#0e9dc7] text-white shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  !isLogin
                    ? "bg-[#0e9dc7] text-white shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Forms */}
          <div className="relative mt-10 min-h-[360px]">
            {/* LOGIN FORM */}
            <form
              className={`${formBaseClass} ${
                isLogin
                  ? "opacity-100 translate-x-0"
                  : "pointer-events-none opacity-0 -translate-x-6"
              }`}
              onSubmit={handleLogin}
              noValidate
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Work email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    if (formError) setFormError("");
                    setEmail(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mt-6 space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    if (formError) setFormError("");
                    setPassword(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Enter your password"
                />
              </div>

              {formError && isLogin && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {formError}
                </div>
              )}
              {formSuccess && isLogin && !formError && (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e9dc7] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0e9dc7]/40 transition hover:bg-[#0c86ab] focus:ring-4 focus:ring-[#0e9dc7]/40 disabled:opacity-70"
              >
                {loading ? "Signing you in..." : "Sign in"}
              </button>
            </form>

            {/* REGISTER FORM */}
            <form
              className={`${formBaseClass} ${
                isLogin
                  ? "pointer-events-none opacity-0 translate-x-6"
                  : "opacity-100 translate-x-0"
              }`}
              onSubmit={handleRegister}
              noValidate
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    if (formError) setFormError("");
                    setFullName(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="mt-6 space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Work email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    if (formError) setFormError("");
                    setEmail(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mt-6 space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    if (formError) setFormError("");
                    setPassword(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Create a password"
                />
              </div>

              <div className="mt-6 space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    if (formError) setFormError("");
                    setConfirmPassword(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Re-enter your password"
                />
              </div>

              {formError && !isLogin && (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e9dc7] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0e9dc7]/40 transition hover:bg-[#0c86ab] focus:ring-4 focus:ring-[#0e9dc7]/40 disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-between text-xs text-slate-500">
            <span>
              {isLogin
                ? "Need an account? Switch to register to get started."
                : "Already have an account? Switch to login to access the app."}
            </span>
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="font-semibold text-[#0e9dc7] transition hover:text-[#0c86ab]"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanderPage;
