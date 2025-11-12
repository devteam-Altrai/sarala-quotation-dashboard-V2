import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../auth/api";
import { useAuthContext } from "../auth/AuthContext";
import { AUTH_URL, BASE_URL } from "../utils/AppConstant";
import bg from "../assets/icon.ico";

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

    // ✅ Convert full name to valid username
    const validUsername = trimmedName
      .toLowerCase()
      .replace(/\s+/g, "_") // replace spaces with underscore
      .replace(/[^a-z0-9@.+-_]/gi, ""); // remove invalid chars

    try {
      setLoading(true);
      setFormError("");
      setFormSuccess("");

      await api.post(`${AUTH_URL}register/`, {
        username: validUsername,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      switchMode("login", {
        force: true,
        successMessage: "Account created successfully. Sign in to continue.",
      });
    } catch (err) {
      console.error("Register error:", err?.response?.data);
      const fallbackMessage =
        "We could not complete your registration. Please try again.";
      const apiMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        JSON.stringify(err?.response?.data) ||
        fallbackMessage;

      setFormError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError("");
      }, 1700); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [formError]);

  const formBaseClass =
    "absolute inset-0 w-full transition-all duration-500 ease-in-out transform";

  return (
    <div className="flex min-h-screen w-full login-gradient items-center justify-center bg-cover bg-center bg-no-repeat bg-black/5 overflow-hidden">
      <div className="w-[95%] sm:w-[90%] md:w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-1 shadow-xl">
        <div className="flex justify-center mt-2">
          <img
            src={bg}
            alt="Sarala Engineering"
            className="h-12 w-auto md:h-14"
          />
        </div>

        <div className="rounded-[1.35rem] bg-white md:pl-8 md:pr-8 md:pb-6 pl-3 pr-3 pb-2">
          {/* Header */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex flex-col items-center">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-sm text-center text-slate-500">
                {isLogin
                  ? "Sign in to continue to your Sarala Engineering workspace."
                  : "Register to access the Sarala Engineering platform."}
              </p>
            </div>

            {/* Switch Buttons */}
            <div className="flex items-center gap-2 mt-2 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isLogin
                    ? "bg-[#0e9dc7] text-white shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                LOGIN
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
                REGISTER
              </button>
            </div>
          </div>

          {/* Forms */}
          <div className="relative mt-2 md:mt-0 min-h-[360px]">
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
                <label className="text-sm font-medium ml-2 text-slate-700">
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
                  className="w-full rounded-xl border mt-0.5 border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mt-6 space-y-1">
                <label className="text-sm font-medium ml-2 text-slate-700">
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
                  className="w-full rounded-xl border mt-0.5 border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Enter your password"
                />
              </div>

              {formError && isLogin && (
                <div className="fixed top-87 right-0 z-50 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-sm text-rose-600 shadow-lg animate-slide-in">
                  {formError}
                </div>
              )}

              {formSuccess && isLogin && !formError && (
                <div className="fixed top-87 right-0 z-50 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-sm text-emerald-700 shadow-lg animate-slide-in">
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
              {/* Register Fields */}
              <div className="space-y-1">
                <label className="text-sm font-medium ml-2 text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 mt-0.5 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Name"
                />
              </div>

              <div className="mt-3 space-y-1">
                <label className="text-sm font-medium ml-2 text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 mt-0.5 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mt-3 space-y-1">
                <label className="text-sm font-medium ml-2 text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 mt-0.5 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Create a password"
                />
              </div>

              <div className="mt-3 space-y-1">
                <label className="text-sm font-medium ml-2 text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 mt-0.5 bg-slate-50 px-4 py-3 text-sm focus:border-[#0e9dc7] focus:bg-white focus:ring-4 focus:ring-[#0e9dc7]/20 outline-none transition"
                  placeholder="Re-enter your password"
                />
              </div>

              {formError && (
                <div className="fixed top-87 right-0 z-50 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-sm text-rose-600 shadow-lg animate-slide-in">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e9dc7] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0e9dc7]/40 transition hover:bg-[#0c86ab] focus:ring-4 focus:ring-[#0e9dc7]/40 disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-12 flex items-center justify-between text-xs text-slate-500">
            <span>
              {isLogin
                ? "Sign Up? Switch to register to get started."
                : "A User? Switch to login to access."}
            </span>
            <button
              type="button"
              onClick={() => switchMode(isLogin ? "register" : "login")}
              className="font-semibold text-[#0e9dc7] transition hover:text-[#0c86ab]"
            >
              {isLogin ? "REGISTER" : "LOGIN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanderPage;
