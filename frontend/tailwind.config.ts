import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7f8fb",
        line: "#d9dee8",
        mint: "#0f9f8f",
        saffron: "#e6a012",
        plum: "#6d4aff",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
