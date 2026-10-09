"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { FoundAccountPreview } from "@/lib/types";
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Check,
  Search,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    lastGeneratedCode,
    login,
    register,
    verifyEmail,
    resendCode,
    searchAccount,
    sendPasswordResetOtp,
    resetPasswordWithOtp,
  } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Certified Organic",
    "Clean Eating",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Facebook-style Forgot Password States
  const [forgotStep, setForgotStep] = useState<"search" | "confirm" | "reset">("search");
  const [forgotEmail, setForgotEmail] = useState("");
  const [foundAccount, setFoundAccount] = useState<FoundAccountPreview | null>(null);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  // Sync pending email
  useEffect(() => {
    if (pendingVerificationEmail && !email) {
      setEmail(pendingVerificationEmail);
    }
  }, [pendingVerificationEmail, email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Reset OTP cooldown timer
  useEffect(() => {
    if (resetCooldown > 0) {
      const timer = setTimeout(() => setResetCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resetCooldown]);

  if (!isAuthModalOpen) return null;

  const availableTags = [
    "Certified Organic",
    "Clean Eating",
    "Gluten-Free",
    "100% Vegan",
    "Keto / Low-Carb",
    "Non-GMO",
    "Dairy-Free",
    "Raw & Cold-Pressed",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      if (res.needsVerification) {
        setPendingVerificationEmail(email);
        setInfoMessage("Please verify your email address to complete sign in.");
      } else {
        setError(res.error || "Failed to sign in");
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const res = await register(
      name,
      email,
      password,
      selectedTags
    );

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to create account");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const targetEmail = pendingVerificationEmail || email;
    const res = await verifyEmail(targetEmail, verificationCode.trim());
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Invalid verification code");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail) {
      setError("Please enter your email address to receive code.");
      return;
    }

    setLoading(true);
    const res = await resendCode(targetEmail);
    setLoading(false);

    if (res.success) {
      setInfoMessage("A new verification code has been sent.");
      setResendCooldown(30);
    } else {
      setError(res.error || "Could not resend verification code.");
    }
  };

  const handleSearchAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    const targetEmail = forgotEmail.trim();
    if (!targetEmail) {
      setError("Please enter your email address to search for your account.");
      return;
    }

    setLoading(true);
    const res = await searchAccount(targetEmail);
    setLoading(false);

    if (res.success && res.account) {
      setFoundAccount(res.account);
      setForgotStep("confirm");
      setInfoMessage("We found your account! Please confirm this is you to proceed.");
    } else {
      setError(res.error || "No account found matching this email. Please check your spelling or sign up.");
    }
  };

  const handleConfirmAccount = async () => {
    if (!foundAccount) return;
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const res = await sendPasswordResetOtp(foundAccount.email);
    setLoading(false);

    if (res.success) {
      setForgotStep("reset");
      setResetCooldown(30);
      setInfoMessage(res.message || `A 6-digit recovery code was sent to ${foundAccount.email}.`);
    } else {
      setError(res.error || "Could not generate reset code. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanOtp = resetOtp.trim();
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification OTP.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    const targetEmail = foundAccount?.email || forgotEmail.trim();
    const res = await resetPasswordWithOtp(targetEmail, cleanOtp, newPassword);
    setLoading(false);

    if (res.success) {
      setInfoMessage("Password reset successfully! You are now securely logged in.");
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setForgotStep("search");
        setForgotEmail("");
        setFoundAccount(null);
        setResetOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setAuthModalTab("signin");
      }, 1200);
    } else {
      setError(res.error || "Failed to reset password. Please verify your OTP code.");
    }
  };

  const handleResendResetOtp = async () => {
    if (resetCooldown > 0 || loading) return;
    const targetEmail = foundAccount?.email || forgotEmail.trim();
    if (!targetEmail) return;

    setLoading(true);
    const res = await sendPasswordResetOtp(targetEmail);
    setLoading(false);

    if (res.success) {
      setResetCooldown(30);
      setInfoMessage("A fresh 6-digit password reset code has been sent.");
    } else {
      setError(res.error || "Could not resend reset code.");
    }
  };

  const fillDemoAccount = () => {
    setEmail("maya.sterling@example.com");
    setPassword("password123");
  };

  const autofillDevCode = () => {
    if (lastGeneratedCode) {
      setVerificationCode(lastGeneratedCode);
    }
  };

  const autofillResetDevCode = () => {
    if (lastGeneratedCode) {
      setResetOtp(lastGeneratedCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-sm ${
              authModalTab === "forgot_password" 
                ? "bg-amber-100 text-amber-800" 
                : "bg-emerald-100 text-emerald-800"
            }`}>
              {authModalTab === "forgot_password" ? (
                <Key className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {authModalTab === "signin"
                  ? "Sign In to CartWise"
                  : authModalTab === "signup"
                  ? "Create Customer Account"
                  : authModalTab === "verify"
                  ? "Verify Your Email"
                  : forgotStep === "search"
                  ? "Find Your Account"
                  : forgotStep === "confirm"
                  ? "Is This Your Account?"
                  : "Reset Your Password"}
              </h3>
              <p className="text-xs text-slate-500">
                {authModalTab === "signin"
                  ? "Access your saved addresses and order tracking"
                  : authModalTab === "signup"
                  ? "Get 15-min delivery and personalized discounts"
                  : authModalTab === "verify"
                  ? "Enter the 6-digit OTP sent to your email"
                  : forgotStep === "search"
                  ? "Enter your email to find your registered account"
                  : forgotStep === "confirm"
                  ? "Confirm identity to receive your recovery OTP"
                  : "Enter the OTP and set your new password"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switching or Navigation */}
        {authModalTab !== "verify" && authModalTab !== "forgot_password" ? (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200">
            <button
              onClick={() => {
                setAuthModalTab("signin");
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalTab === "signin"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthModalTab("signup");
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authModalTab === "signup"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>
        ) : authModalTab === "forgot_password" ? (
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            {forgotStep === "search" ? (
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab("signin");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            ) : forgotStep === "confirm" ? (
              <button
                type="button"
                onClick={() => {
                  setForgotStep("search");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Search another email</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setForgotStep("confirm");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Account info</span>
              </button>
            )}

            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span className={forgotStep === "search" ? "text-emerald-700 font-bold" : ""}>1. Search</span>
              <span>→</span>
              <span className={forgotStep === "confirm" ? "text-emerald-700 font-bold" : ""}>2. Confirm</span>
              <span>→</span>
              <span className={forgotStep === "reset" ? "text-emerald-700 font-bold" : ""}>3. Reset</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setAuthModalTab("signin");
                setError(null);
                setInfoMessage(null);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* Info Notification */}
        {infoMessage && (
          <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* DEV MODE OTP HELPER BANNER FOR EMAIL VERIFICATION */}
        {authModalTab === "verify" && lastGeneratedCode && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Dev OTP: <strong className="font-mono text-sm tracking-widest text-slate-900">{lastGeneratedCode}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={autofillDevCode}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3 h-3" />
              <span>Auto-fill</span>
            </button>
          </div>
        )}

        {/* DEV MODE OTP HELPER BANNER FOR PASSWORD RESET */}
        {authModalTab === "forgot_password" && forgotStep === "reset" && lastGeneratedCode && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                Dev Reset OTP: <strong className="font-mono text-sm tracking-widest text-slate-900">{lastGeneratedCode}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={autofillResetDevCode}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-[11px] font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3 h-3" />
              <span>Auto-fill</span>
            </button>
          </div>
        )}

        {/* Form Content */}
        {authModalTab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab("forgot_password");
                    setForgotStep("search");
                    setForgotEmail(email || "");
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Signing in…" : "Sign In"}</span>
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Quick Demo:</span>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-emerald-700 hover:underline font-bold cursor-pointer"
              >
                Maya Sterling (VIP)
              </button>
            </div>
          </form>
        ) : authModalTab === "signup" ? (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Dietary Regimen</label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.slice(0, 5).map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-400"
                          : "bg-slate-50 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Creating Account…" : "Register & Get OTP"}</span>
            </button>
          </form>
        ) : authModalTab === "verify" ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-600">
                Verification code sent to <strong className="text-slate-900 font-medium">{pendingVerificationEmail || email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 text-center font-mono text-lg tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Verifying…" : "Verify & Sign In"}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-xs text-emerald-700 hover:underline font-bold disabled:text-slate-400 disabled:no-underline cursor-pointer flex items-center gap-1 mx-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend Verification Code"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* FACEBOOK-STYLE FORGOT PASSWORD MULTI-STEP FLOW */
          <div>
            {forgotStep === "search" ? (
              <form onSubmit={handleSearchAccount} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Find Your CartWise Account
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Enter the email associated with your account to search our records.
                  </p>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. maya.sterling@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !forgotEmail.trim()}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? "Searching Account…" : "Search Account"}</span>
                </button>

                {/* Quick demo hint */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Try Demo Account:</span>
                  <button
                    type="button"
                    onClick={() => setForgotEmail("maya.sterling@example.com")}
                    className="text-emerald-700 hover:underline font-bold cursor-pointer"
                  >
                    maya.sterling@example.com
                  </button>
                </div>
              </form>
            ) : forgotStep === "confirm" ? (
              <div className="space-y-4">
                {foundAccount && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-200/80 shadow-xs space-y-3">
                    <div className="flex items-center gap-3.5">
                      {foundAccount.avatar_url ? (
                        <img
                          src={foundAccount.avatar_url}
                          alt={foundAccount.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-base shadow-xs">
                          {foundAccount.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {foundAccount.name}
                          </h4>
                          {foundAccount.vip_level && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300/80">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>{foundAccount.vip_level}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-600 font-mono mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{foundAccount.maskedEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>
                        We will send a 6-digit confirmation code to your email to verify account ownership.
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleConfirmAccount}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? "Generating OTP…" : "This is my account — Send OTP"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("search");
                      setFoundAccount(null);
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Not your account? Search another email
                  </button>
                </div>
              </div>
            ) : (
              /* RESET PASSWORD STEP */
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="text-center space-y-0.5 pb-1">
                  <p className="text-xs text-slate-600">
                    Recovery code sent to{" "}
                    <strong className="text-slate-900 font-semibold">
                      {foundAccount?.maskedEmail || forgotEmail}
                    </strong>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 text-center font-mono text-base tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetOtp.length < 6 || !newPassword || !confirmPassword}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                >
                  <Key className="w-4 h-4" />
                  <span>{loading ? "Resetting Password…" : "Update Password & Sign In"}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={resetCooldown > 0 || loading}
                    className="text-xs text-emerald-700 hover:underline font-bold disabled:text-slate-400 disabled:no-underline cursor-pointer flex items-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>
                      {resetCooldown > 0 ? `Resend OTP in ${resetCooldown}s` : "Resend Password Reset OTP"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
