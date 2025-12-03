import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { SIZES } from "../theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "folder-open-outline",
  title,
  description,
  actionLabel,
  onAction
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surfaceVariant }
        ]}
      >
        <Ionicons
          name={icon}
          size={48}
          color={theme.colors.textTertiary}
        />
      </View>

      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>

      {description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          size="small"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.xxl
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.lg
  },
  title: {
    fontSize: SIZES.fontXl,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SIZES.sm
  },
  description: {
    fontSize: SIZES.fontMd,
    textAlign: "center",
    marginBottom: SIZES.lg,
    lineHeight: 22
  },
  button: {
    marginTop: SIZES.sm
  }
});
