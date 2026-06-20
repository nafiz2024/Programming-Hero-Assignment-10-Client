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
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      desktop: "1200px",
      xl: "1440px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        background: "rgb(var(--pf-color-background) / <alpha-value>)",
        "background-alt": "rgb(var(--pf-color-background-alt) / <alpha-value>)",
        surface: "rgb(var(--pf-color-surface) / <alpha-value>)",
        card: "rgb(var(--pf-color-card) / <alpha-value>)",
        "card-strong": "rgb(var(--pf-color-card-strong) / <alpha-value>)",
        border: "rgb(var(--pf-color-border) / <alpha-value>)",
        foreground: "rgb(var(--pf-color-foreground) / <alpha-value>)",
        muted: "rgb(var(--pf-color-muted) / <alpha-value>)",
        primary: "rgb(var(--pf-color-primary) / <alpha-value>)",
        secondary: "rgb(var(--pf-color-secondary) / <alpha-value>)",
        success: "rgb(var(--pf-color-success) / <alpha-value>)",
        warning: "rgb(var(--pf-color-warning) / <alpha-value>)",
        danger: "rgb(var(--pf-color-danger) / <alpha-value>)",
      },
      fontSize: {
        "display-lg": ["clamp(2.75rem, 2.2rem + 2.2vw, 4.5rem)", { lineHeight: "1", fontWeight: "700" }],
        "display-md": ["clamp(2.25rem, 1.9rem + 1.4vw, 3.5rem)", { lineHeight: "1.05", fontWeight: "700" }],
        h1: ["clamp(1.875rem, 1.55rem + 1vw, 2.75rem)", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["clamp(1.5rem, 1.3rem + 0.7vw, 2rem)", { lineHeight: "1.15", fontWeight: "600" }],
        h3: ["clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)", { lineHeight: "1.2", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.7", fontWeight: "400" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-xs": ["0.8125rem", { lineHeight: "1.5", fontWeight: "500" }],
      },
      spacing: {
        1: "var(--pf-space-1)",
        2: "var(--pf-space-2)",
        3: "var(--pf-space-3)",
        4: "var(--pf-space-4)",
        5: "var(--pf-space-5)",
        6: "var(--pf-space-6)",
        7: "var(--pf-space-7)",
        8: "var(--pf-space-8)",
        gutter: "clamp(16px, 3vw, 32px)",
        section: "clamp(32px, 6vw, 64px)",
      },
      borderRadius: {
        sm: "var(--pf-radius-sm)",
        md: "var(--pf-radius-md)",
        lg: "var(--pf-radius-lg)",
        xl: "var(--pf-radius-xl)",
        pill: "var(--pf-radius-pill)",
      },
      boxShadow: {
        card: "var(--pf-shadow-card)",
        glow: "var(--pf-shadow-glow)",
        modal: "var(--pf-shadow-modal)",
      },
      backgroundImage: {
        "brand-gradient": "var(--pf-gradient-brand)",
        "surface-gradient": "var(--pf-gradient-surface)",
        "glass-gradient": "var(--pf-gradient-glass)",
        "page-gradient": "var(--pf-gradient-page)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.75", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "float-soft": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2.8s ease-in-out infinite",
        "float-soft": "float-soft 4s ease-in-out infinite",
      },
    },
  },
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#060a18",
            foreground: "#f3f7ff",
            primary: "#8b5cf6",
            secondary: "#60a5fa",
            success: "#4ade80",
            warning: "#facc15",
            danger: "#f87171",
          },
        },
      },
    }),
  ],
};
