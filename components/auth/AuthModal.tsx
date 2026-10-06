"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
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

    const res = await register(name, email, password, selectedTags);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to create account");
    } else {
      setInfoMessage("Verification code has been sent to your email!");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail) {
      setError("Email address is missing. Please enter your email.");
      return;
    }
    if (!verificationCode || verificationCode.trim().length < 4) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    const res = await verifyEmail(targetEmail, verificationCode.trim());
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Verification failed. Please check the code.");
    }
  };

  const handleResend = async () => {
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail) {
      setError("Please specify email address to resend code.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await resendCode(targetEmail);
    setLoading(false);
    if (res.success) {
      setResendCooldown(30);
      setInfoMessage("A fresh verification code has been sent!");
    } else {
      setError(res.error || "Failed to resend code.");
    }
  };

  const fillDemoAccount = () => {
    setEmail("maya.sterling@aura.ai");
    setPassword("password123");
    setError(null);
    setInfoMessage(null);
  };

  const autofillDevCode = () => {
    if (lastGeneratedCode) {
      setVerificationCode(lastGeneratedCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0e1422] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-500/10 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px]">
            <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight text-white">CartWise PLUS</h3>
            <p className="text-[10px] text-cyan-300 font-mono uppercase tracking-wider">
              {authModalTab === "verify" ? "Secure Email Verification" : "AI Verified Membership"}
            </p>
          </div>
        </div>

        {/* Tabs: Sign In / Create Account (Hidden when on Verify view) */}
        {authModalTab !== "verify" ? (
          <div className="grid grid-cols-2 p-1 bg-[#141b2b] rounded-2xl mb-4 border border-white/5">
            <button
              onClick={() => {
                setAuthModalTab("signin");
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authModalTab === "signin"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
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
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authModalTab === "signup"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setAuthModalTab("signin");
                setError(null);
                setInfoMessage(null);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* Info Notification */}
        {infoMessage && (
          <div className="mb-3.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-cyan-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* DEV MODE OTP HELPER BANNER */}
        {authModalTab === "verify" && lastGeneratedCode && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Dev OTP: <strong className="font-mono text-sm tracking-widest text-white">{lastGeneratedCode}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={autofillDevCode}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3 h-3 text-emerald-300" />
              <span>Auto-fill</span>
            </button>
          </div>
        )}

        {/* Form Content */}
        {authModalTab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aura.ai"
                  className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Authenticating…" : "Sign In to CartWise"}</span>
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Quick Demo fill:</span>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Maya Sterling (VIP)
              </button>
            </div>
          </form>
        ) : authModalTab === "signup" ? (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@domain.com"
                  className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose password"
                  className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            {/* Initial Personalisation Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Dietary & Grocery Preferences (Personalisation)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {availableTags.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isChecked
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                          : "bg-[#141b2a] text-slate-400 hover:text-slate-200 border border-white/5"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-2.5 h-2.5 text-cyan-300" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Creating Profile…" : "Create VIP Account"}</span>
            </button>
          </form>
        ) : (
          /* EMAIL VERIFICATION SCREEN */
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3 bg-[#131a29] rounded-2xl border border-white/5 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-xs font-semibold text-white">Enter Verification Code</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-cyan-300">
                  {pendingVerificationEmail || email || "your email"}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 text-center">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="w-full text-center text-xl font-mono tracking-[0.4em] py-3 bg-[#151c2e] border border-white/15 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Verifying…" : "Verify & Complete Setup"}</span>
            </button>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
                className="text-cyan-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>MongoDB Persistent Vault • 100% Zero-Leak Security</span>
        </div>
      </div>
    </div>
  );
}
