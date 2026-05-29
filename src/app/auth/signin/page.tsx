"use client";
import { useState } from "react";
import { handleDeveloperSignIn } from "./actions";
import Link from "next/link";
import { GlowCard } from "@/components/ui/GlowCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const targetEmail = email.trim();
    if (!targetEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(targetEmail)) {
      setError("Please enter a valid email format (e.g. name@domain.com).");
      return;
    }

    setLoading(true);
    try {
      await handleDeveloperSignIn(targetEmail);
    } catch (e: any) {
      // Server actions throw NEXT_REDIRECT to perform navigation, which is caught by Next.js router
      if (e.message !== "NEXT_REDIRECT") {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 text-white select-none">
      <GlowCard glowColor="rgba(59,130,246,0.2)" className="w-full max-w-sm p-10 flex flex-col items-center">
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

          {error && (
            <p className="text-[12px] font-semibold text-rose-400 pl-0.5 animate-pulse">
              ⚠️ {error}
            </p>
          )}

          <MagneticButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : (
              "Sign In / Sign Up"
            )}
          </MagneticButton>
        </form>

        <p className="mt-8 text-[11px] text-gray-500 font-medium leading-relaxed text-center">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
        </p>
      </GlowCard>
    </div>
  );
}
