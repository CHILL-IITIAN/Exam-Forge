/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "rgb(var(--bg) / <alpha-value>)",
        raised:    "rgb(var(--bg-raised) / <alpha-value>)",
        elevated:  "rgb(var(--bg-elevated) / <alpha-value>)",
        hover:     "rgb(var(--bg-hover) / <alpha-value>)",
        text:      "rgb(var(--text) / <alpha-value>)",
        muted:     "rgb(var(--text-muted) / <alpha-value>)",
        dim:       "rgb(var(--text-dim) / <alpha-value>)",
        red: {
          DEFAULT: "rgb(var(--red) / <alpha-value>)",
          soft:    "rgb(var(--red-soft) / <alpha-value>)",
        },
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.06)",
        strong:  "rgba(255,255,255,0.10)",
      },
      borderRadius: { xl2: "20px" },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.4)",
        red:  "0 0 0 1px rgba(225,29,46,0.45), 0 6px 20px rgba(225,29,46,0.30)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
