export const themeColors = {
  background: "#060a18",
  backgroundAlt: "#0b1023",
  surface: "#0f172a",
  card: "#121c30",
  cardStrong: "#18233a",
  border: "#48587a",
  foreground: "#f3f7ff",
  muted: "#9aa6c0",
  primary: "#8b5cf6",
  secondary: "#60a5fa",
  success: "#4ade80",
  warning: "#facc15",
  danger: "#f87171",
};

export const themeSpacing = {
  4: "4px",
  8: "8px",
  12: "12px",
  16: "16px",
  24: "24px",
  32: "32px",
  48: "48px",
  64: "64px",
};

export const themeTypography = {
  heading: {
    displayLg: "clamp(2.75rem, 2.2rem + 2.2vw, 4.5rem)",
    displayMd: "clamp(2.25rem, 1.9rem + 1.4vw, 3.5rem)",
    h1: "clamp(1.875rem, 1.55rem + 1vw, 2.75rem)",
    h2: "clamp(1.5rem, 1.3rem + 0.7vw, 2rem)",
    h3: "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)",
  },
  body: {
    lg: "1.125rem",
    base: "1rem",
    sm: "0.9375rem",
    xs: "0.8125rem",
  },
  mobile: {
    h1: "2rem",
    h2: "1.5rem",
    body: "0.9375rem",
  },
};

export const themeRadius = {
  sm: "14px",
  md: "18px",
  lg: "24px",
  xl: "30px",
  pill: "9999px",
};

export const themeShadows = {
  card: "0 20px 60px rgba(2, 6, 23, 0.38)",
  glow: "0 0 0 1px rgba(139, 92, 246, 0.1), 0 20px 60px rgba(96, 165, 250, 0.18)",
  modal: "0 36px 120px rgba(2, 6, 23, 0.55)",
};

export const themeGradients = {
  brand: "linear-gradient(135deg, #8b5cf6 0%, #60a5fa 52%, #38bdf8 100%)",
  surface: "linear-gradient(180deg, rgba(18, 28, 48, 0.92) 0%, rgba(11, 17, 34, 0.98) 100%)",
  glass: "linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(96, 165, 250, 0.06) 48%, rgba(10, 15, 30, 0.5) 100%)",
  page: "radial-gradient(circle at top left, rgba(139, 92, 246, 0.22), transparent 26%), radial-gradient(circle at top right, rgba(96, 165, 250, 0.14), transparent 24%), linear-gradient(180deg, #050816 0%, #080d1f 45%, #060a18 100%)",
};

export const themeBreakpoints = {
  tablet: "768px",
  desktop: "1200px",
};

const theme = {
  colors: themeColors,
  spacing: themeSpacing,
  typography: themeTypography,
  radius: themeRadius,
  shadows: themeShadows,
  gradients: themeGradients,
  breakpoints: themeBreakpoints,
};

export default theme;
