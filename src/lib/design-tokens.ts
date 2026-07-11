/**
 * Premium Design Tokens
 * Single source of truth for all design values
 * Includes animations, spacing, colors, typography, and more
 */

// ============================================
// ANIMATION & EASING CONFIGURATION
// ============================================

export const animationConfig = {
  easing: {
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    sharp: "cubic-bezier(0.4, 0, 1, 1)",
    elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smoothOut: "cubic-bezier(0, 0, 0.2, 1)",
    smoothInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    snappy: "cubic-bezier(0.3, 0.8, 0.4, 1)",
  },

  duration: {
    fastest: 75,
    faster: 100,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
  },

  transition: {
    fast: { duration: 0.15, ease: "easeOut" },
    normal: { duration: 0.2, ease: "easeOut" },
    slow: { duration: 0.3, ease: "easeOut" },
    smooth: { duration: 0.4, ease: "easeInOut" },
  },

  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    slideUp: {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 16 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    slideDown: {
      initial: { opacity: 0, y: -16 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -16 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    slideLeft: {
      initial: { opacity: 0, x: 16 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 16 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    slideRight: {
      initial: { opacity: 0, x: -16 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -16 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2 },
    },
    popIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { duration: 0.25, ease: "easeOut" },
    },
    floatIn: {
      initial: { opacity: 0, y: 32 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 32 },
      transition: { duration: 0.35, ease: "easeOut" },
    },
    rotateIn: {
      initial: { opacity: 0, rotate: -10 },
      animate: { opacity: 1, rotate: 0 },
      exit: { opacity: 0, rotate: -10 },
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },

  // Container animations for staggered children
  containerVariants: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },

  // Item animations for staggered children
  itemVariants: {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
};

// ============================================
// SPACING SYSTEM (8px base)
// ============================================

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  "4xl": "4rem",
  "5xl": "5rem",
} as const;

// ============================================
// BORDER RADIUS SYSTEM
// ============================================

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  "3xl": "1.5rem",
  "4xl": "2rem",
  full: "9999px",
} as const;

// ============================================
// SHADOW SYSTEM
// ============================================

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
  md: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
  lg: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
  xl: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
  "2xl": "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
  "3xl": "0 35px 60px -15px rgba(15, 23, 42, 0.3)",
  inner: "inset 0 2px 4px 0 rgba(15, 23, 42, 0.05)",
  glow: "0 0 20px rgba(22, 101, 52, 0.15)",
  "glow-md": "0 0 40px rgba(22, 101, 52, 0.2)",
  "glow-lg": "0 0 60px rgba(22, 101, 52, 0.25)",
  "glow-xl": "0 0 80px rgba(22, 101, 52, 0.3)",
} as const;

// ============================================
// TRANSITION SYSTEM
// ============================================

export const transitions = {
  default: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  fast: "all 100ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  colors: "background-color 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
  transform: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  opacity: "opacity 200ms ease",
} as const;

// ============================================
// TYPOGRAPHY SYSTEM
// ============================================

export const typography = {
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    display: '"Poppins", ui-sans-serif, system-ui, sans-serif',
    mono: '"Monaco", "Courier New", monospace',
  },
  fontSize: {
    xs: { size: "0.75rem", lineHeight: "1rem" },
    sm: { size: "0.875rem", lineHeight: "1.25rem" },
    base: { size: "1rem", lineHeight: "1.5rem" },
    lg: { size: "1.125rem", lineHeight: "1.75rem" },
    xl: { size: "1.25rem", lineHeight: "1.75rem" },
    "2xl": { size: "1.5rem", lineHeight: "2rem" },
    "3xl": { size: "1.875rem", lineHeight: "2.25rem" },
    "4xl": { size: "2.25rem", lineHeight: "2.5rem" },
    "5xl": { size: "3rem", lineHeight: "1" },
    "6xl": { size: "3.75rem", lineHeight: "1" },
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  letterSpacing: {
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0em",
    wide: "0.02em",
    wider: "0.05em",
    widest: "0.1em",
  },
} as const;

// ============================================
// Z-INDEX SYSTEM
// ============================================

export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================
// RESPONSIVE BREAKPOINTS
// ============================================

export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================
// COLOR PALETTE (for reference)
// ============================================

export const colors = {
  // Light theme
  light: {
    background: "#F8FAF8",
    foreground: "#1F2937",
    card: "#FFFFFF",
    primary: "#166534",
    secondary: "#22c55e",
    accent: "#84cc16",
    muted: "#F3F7F3",
    border: "#E6F0EA",
    destructive: "#DC2626",
  },
  // Dark theme
  dark: {
    background: "#0F1712",
    foreground: "#EAF3EC",
    card: "#172420",
    primary: "#4ADE80",
    secondary: "#22c55e",
    accent: "#A3E635",
    muted: "#1C2A24",
    border: "#24352E",
    destructive: "#F87171",
  },
} as const;
