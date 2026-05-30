"use client";
import { useState } from "react";
import { handleCustomSignIn, handleCustomSignUp } from "./actions";
import Link from "next/link";
import { GlowCard } from "@/components/ui/GlowCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccessMessage("");

    const targetEmail = email.trim();
    const targetPassword = password;

    if (!targetEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(targetEmail)) {
      setError("Please enter a valid email format (e.g. name@domain.com).");
      return;
    }

    if (!targetPassword || targetPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await handleCustomSignIn(targetEmail, targetPassword);
      } else {
        const res = await handleCustomSignUp(targetEmail, targetPassword);
        if (res?.success) {
          setSuccessMessage("Account created successfully! Please sign in using your credentials.");
          setPassword(""); // Clear password field for sign-in
          setMode("signin"); // Toggle to sign in mode
        }
      }
    } catch (e: any) {
      // In Next.js, Server Action redirects throw an error object to perform client-side navigation.
      // If the error message, type, or digest includes 'NEXT_REDIRECT' or 'redirect', it is a normal redirect.
      const isRedirect = 
        e.message?.includes("NEXT_REDIRECT") || 
        e.message?.includes("redirect") || 
        e.digest?.includes("NEXT_REDIRECT") ||
        String(e).includes("NEXT_REDIRECT") ||
        String(e).includes("redirect");

      if (isRedirect) {
        // Let Next.js handle the routing!
        return;
      }
      
      console.error("Auth action error:", e);
      setError(e.message || "Authentication failed. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 text-white select-none">
      <GlowCard glowColor="rgba(59,130,246,0.2)" className="w-full max-w-md p-10 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 font-bold text-[20px] tracking-widest text-white group cursor-pointer mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            T
          </div>
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TRAVIQ <span className="text-blue-500">AI</span>
          </span>
        </div>
        <p className="text-[13px] text-gray-400 font-medium mb-8">Your AI-Powered Travel CFO</p>

        {/* Form Mode Toggle */}
        <div className="flex w-full bg-white/[0.03] border border-white/10 rounded-xl p-1 mb-8">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "signin"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-0.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] text-[13px] text-white bg-white/[0.02] outline-none transition-all focus:border-blue-500 focus:bg-white/[0.04] focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-0.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-white/[0.08] text-[13px] text-white bg-white/[0.02] outline-none transition-all focus:border-blue-500 focus:bg-white/[0.04] focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-[12px] font-semibold text-rose-400 pl-0.5 animate-pulse">
              ⚠️ {error}
            </p>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-[12px] font-semibold text-emerald-400 leading-relaxed pl-3.5">
              ✨ {successMessage}
            </div>
          )}

          <MagneticButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            disabled={loading || !email.trim() || !password}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                {mode === "signin" ? "Signing In..." : "Creating Account..."}
              </span>
            ) : (
              mode === "signin" ? "Sign In" : "Create Account"
            )}
          </MagneticButton>
        </form>

        <p className="mt-8 text-[11px] text-gray-500 font-medium leading-relaxed text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
        </p>
      </GlowCard>
    </div>
  );
}
