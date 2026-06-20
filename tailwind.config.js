const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/hooks/**/*.{js,jsx,mdx}",
    "./src/lib/**/*.{js,jsx,mdx}",
    "./src/providers/**/*.{js,jsx,mdx}",
    "./src/data/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        foreground: "#0f172a",
        primary: "#2563eb",
        secondary: "#14b8a6",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#f8fafc",
            foreground: "#0f172a",
            primary: "#2563eb",
            secondary: "#14b8a6",
            success: "#16a34a",
            warning: "#f59e0b",
            danger: "#dc2626",
          },
        },
      },
    }),
  ],
};
