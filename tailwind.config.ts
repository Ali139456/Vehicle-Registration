import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(29, 78, 216, 0.4)",
        card: "0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(30, 58, 95, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
