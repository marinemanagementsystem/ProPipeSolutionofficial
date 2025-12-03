import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  // Primary colors
  primary: "#0891b2",
  primaryLight: "#22d3ee",
  primaryDark: "#0e7490",

  // Secondary colors
  secondary: "#8b5cf6",
  secondaryLight: "#a78bfa",
  secondaryDark: "#7c3aed",

  // Status colors
  success: "#10b981",
  successLight: "#34d399",
  successDark: "#059669",

  error: "#ef4444",
  errorLight: "#f87171",
  errorDark: "#dc2626",

  warning: "#f59e0b",
  warningLight: "#fbbf24",
  warningDark: "#d97706",

  info: "#3b82f6",
  infoLight: "#60a5fa",
  infoDark: "#2563eb",

  // Neutral colors - Light theme
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceVariant: "#f1f5f9",
  border: "#e2e8f0",

  // Text colors - Light theme
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textTertiary: "#94a3b8",
  textInverse: "#ffffff",

  // Dark theme colors
  dark: {
    background: "#0f172a",
    surface: "#1e293b",
    surfaceVariant: "#334155",
    border: "#475569",
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5e1",
    textTertiary: "#64748b",
  },

  // Gradient colors
  gradient: {
    primary: ["#0891b2", "#06b6d4", "#22d3ee"],
    secondary: ["#7c3aed", "#8b5cf6", "#a78bfa"],
    success: ["#059669", "#10b981", "#34d399"],
    dark: ["#0f172a", "#1e293b", "#334155"],
  },

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
};

export const SIZES = {
  // Screen dimensions
  width,
  height,

  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Font sizes
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 18,
  font2xl: 20,
  font3xl: 24,
  font4xl: 28,
  font5xl: 32,

  // Icon sizes
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,

  // Component heights
  buttonHeight: 48,
  inputHeight: 52,
  headerHeight: 60,
  tabBarHeight: 80,
  cardMinHeight: 100,
};

export const FONTS = {
  regular: {
    fontFamily: "System",
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: "System",
    fontWeight: "500" as const,
  },
  semiBold: {
    fontFamily: "System",
    fontWeight: "600" as const,
  },
  bold: {
    fontFamily: "System",
    fontWeight: "700" as const,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export type ThemeMode = "light" | "dark";

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    success: string;
    successLight: string;
    successDark: string;
    error: string;
    errorLight: string;
    errorDark: string;
    warning: string;
    warningLight: string;
    warningDark: string;
    info: string;
    infoLight: string;
    infoDark: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    overlay: string;
    overlayLight: string;
  };
}

export const lightTheme: Theme = {
  mode: "light",
  colors: {
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    primaryDark: COLORS.primaryDark,
    secondary: COLORS.secondary,
    secondaryLight: COLORS.secondaryLight,
    secondaryDark: COLORS.secondaryDark,
    success: COLORS.success,
    successLight: COLORS.successLight,
    successDark: COLORS.successDark,
    error: COLORS.error,
    errorLight: COLORS.errorLight,
    errorDark: COLORS.errorDark,
    warning: COLORS.warning,
    warningLight: COLORS.warningLight,
    warningDark: COLORS.warningDark,
    info: COLORS.info,
    infoLight: COLORS.infoLight,
    infoDark: COLORS.infoDark,
    background: COLORS.background,
    surface: COLORS.surface,
    surfaceVariant: COLORS.surfaceVariant,
    border: COLORS.border,
    textPrimary: COLORS.textPrimary,
    textSecondary: COLORS.textSecondary,
    textTertiary: COLORS.textTertiary,
    textInverse: COLORS.textInverse,
    overlay: COLORS.overlay,
    overlayLight: COLORS.overlayLight,
  },
};

export const darkTheme: Theme = {
  mode: "dark",
  colors: {
    primary: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    primaryDark: COLORS.primaryDark,
    secondary: COLORS.secondary,
    secondaryLight: COLORS.secondaryLight,
    secondaryDark: COLORS.secondaryDark,
    success: COLORS.success,
    successLight: COLORS.successLight,
    successDark: COLORS.successDark,
    error: COLORS.error,
    errorLight: COLORS.errorLight,
    errorDark: COLORS.errorDark,
    warning: COLORS.warning,
    warningLight: COLORS.warningLight,
    warningDark: COLORS.warningDark,
    info: COLORS.info,
    infoLight: COLORS.infoLight,
    infoDark: COLORS.infoDark,
    background: COLORS.dark.background,
    surface: COLORS.dark.surface,
    surfaceVariant: COLORS.dark.surfaceVariant,
    border: COLORS.dark.border,
    textPrimary: COLORS.dark.textPrimary,
    textSecondary: COLORS.dark.textSecondary,
    textTertiary: COLORS.dark.textTertiary,
    textInverse: COLORS.textPrimary,
    overlay: COLORS.overlay,
    overlayLight: COLORS.overlayLight,
  },
};
