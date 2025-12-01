import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const brand = {
  primary: "#2563eb",
  secondary: "#22d3ee",
  surface: "#0b1224",
  accent: "#14b8a6",
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
    tertiary: brand.accent,
    background: "#f5f7fb",
    surface: "#ffffff",
    surfaceVariant: "#e2e8f0",
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
    tertiary: brand.accent,
    background: brand.surface,
    surface: "#0f172a",
    surfaceVariant: "#1f2937",
  },
};
