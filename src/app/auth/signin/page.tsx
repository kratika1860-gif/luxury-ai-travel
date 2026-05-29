// src/app/auth/signin/page.tsx
"use client";
import { handleDeveloperSignIn } from "./actions";
import Link from "next/link";
import { GlowCard } from "@/components/ui/GlowCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 text-white select-none">
      <GlowCard glowColor="rgba(59,130,246,0.2)" className="w-full max-w-sm p-10 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 font-bold text-[20px] tracking-widest text-white group cursor-pointer mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            T
          </div>
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TRAVIQ <span className="text-blue-500">AI</span>
          </span>
        </div>
        <p className="text-[13px] text-gray-400 font-medium mb-10">Your AI-Powered Travel CFO</p>

        <MagneticButton
          onClick={async () => {
            try {
              await handleDeveloperSignIn();
            } catch (e) {
              // Server actions throw redirects which are caught by the Next.js router
            }
          }}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Sign in as Developer / Guest
        </MagneticButton>

        <p className="mt-8 text-[11px] text-gray-500 font-medium leading-relaxed text-center">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-white transition-colors">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
        </p>
      </GlowCard>
    </div>
  );
}
