/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#f8fafc",
        card: "#0d0d12",
        cardBorder: "rgba(255,255,255,0.06)",
        primary: "#3b82f6",
        primaryForeground: "#ffffff",
        muted: "#8a8a93",
        accent: "rgba(255,255,255,0.03)",
        accentForeground: "#ffffff",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(0, 0, 0, 0.8)",
        float: "0 20px 40px -10px rgba(0, 0, 0, 0.9)",
        glow: "0 0 40px -10px rgba(59, 130, 246, 0.2)",
        "glow-blue": "0 0 20px -5px rgba(59, 130, 246, 0.5)",
        "glow-cyan": "0 0 20px -5px rgba(6, 182, 212, 0.5)",
        "glow-purple": "0 0 20px -5px rgba(168, 85, 247, 0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "blob": "blob 7s infinite",
        "blob-slow": "blob 10s infinite",
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s infinite alternate",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowPulse: {
          "0%": { boxShadow: "0 0 15px -3px rgba(59, 130, 246, 0.3)" },
          "100%": { boxShadow: "0 0 25px 2px rgba(6, 182, 212, 0.6)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        }
      },
    },
  },
  plugins: [],
};
