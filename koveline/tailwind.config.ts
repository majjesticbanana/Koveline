import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241a12",
        coffee: "#6b4628",
        "coffee-deep": "#4a2f1a",
        caramel: "#be824b",
        cream: "#f2e9db",
        surface: "#fcf7ef",
        latte: "#e9dac4",
        line: "#ddc9ac",
        lagoon: "#15706a",
        "lagoon-deep": "#0f544f",
        "lagoon-soft": "#dcebe8",
        green: "#3f7a3a",
        "green-bg": "#e6f0dc",
        "green-line": "#c4dcae",
        red: "#b14a38",
        "red-bg": "#f5e1da",
        "red-line": "#e6c2b4",
        muted: "#8a7461",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        thaana: ["var(--font-thaana)", "var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        warm: "0 18px 44px -22px rgba(36,26,18,.42)",
        "warm-sm": "0 6px 18px -10px rgba(36,26,18,.40)",
      },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        mqA: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        mqB: { from: { transform: "translateX(-50%)" }, to: { transform: "translateX(0)" } },
      },
      animation: {
        rise: "rise .3s ease",
        fade: "fade .3s ease",
        mqA: "mqA 34s linear infinite",
        mqB: "mqB 40s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
