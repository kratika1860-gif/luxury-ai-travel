// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRAVIQ AI — Your AI Travel CFO",
  description:
    "Stop overspending on trips. TRAVIQ AI predicts real costs, optimizes forex, maximizes credit card rewards, and keeps you on budget.",
};

import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen relative text-foreground bg-background">
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
