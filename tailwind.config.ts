import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        autox: {
          red: "#ED1C24",
          redDark: "#B8151B",
          black: "#000000",
          panel: "#080808",
          panel2: "#111111",
          panel3: "#161616",
          border: "#222222",
          gray: "#A0A0A0",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        redGlow: "0 0 40px rgba(237,28,36,0.35)",
        cardGlow: "0 0 0 1px rgba(237,28,36,0.4), 0 8px 24px rgba(237,28,36,0.15)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
