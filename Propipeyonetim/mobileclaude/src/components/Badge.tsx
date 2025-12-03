import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SIZES } from "../theme";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "secondary";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "small" | "medium";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "medium",
  style
}) => {
  const { theme } = useTheme();

  const getVariantColors = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: `${theme.colors.success}20`,
          textColor: theme.colors.success
        };
      case "warning":
        return {
          backgroundColor: `${theme.colors.warning}20`,
          textColor: theme.colors.warning
        };
      case "error":
        return {
          backgroundColor: `${theme.colors.error}20`,
          textColor: theme.colors.error
        };
      case "info":
        return {
          backgroundColor: `${theme.colors.info}20`,
          textColor: theme.colors.info
        };
      case "secondary":
        return {
          backgroundColor: `${theme.colors.secondary}20`,
          textColor: theme.colors.secondary
        };
      default:
        return {
          backgroundColor: `${theme.colors.primary}20`,
          textColor: theme.colors.primary
        };
    }
  };

  const colors = getVariantColors();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10
        },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.textColor,
            fontSize: isSmall ? SIZES.fontXs : SIZES.fontSm
          }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: SIZES.radiusFull,
    alignSelf: "flex-start"
  },
  text: {
    fontWeight: "600"
  }
});
