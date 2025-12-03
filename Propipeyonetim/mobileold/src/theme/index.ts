import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const brand = {
  primary: "#2563eb",
  secondary: "#22d3ee",
  surface: "#0b1224",
  accent: "#14b8a6",
  softSurface: "#0f172a",
  lightSurface: "#ffffff",
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
    tertiary: brand.accent,
    background: "#f1f5ff",
    surface: brand.lightSurface,
    surfaceVariant: "#e2e8f0",
    elevation: MD3LightTheme.colors.elevation,
  },
  roundness: 14,
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
    tertiary: brand.accent,
    background: brand.surface,
    surface: brand.softSurface,
    surfaceVariant: "#111a2e",
    elevation: MD3DarkTheme.colors.elevation,
  },
  roundness: 14,
};
