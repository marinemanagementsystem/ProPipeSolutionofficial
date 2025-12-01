import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  accent = "#2563eb",
}) => {
  return (
    <Surface style={styles.card} elevation={2}>
      <LinearGradient
        colors={[accent, "#0f172a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text variant="labelLarge" style={styles.label}>
          {title}
        </Text>
        <Text variant="headlineMedium" style={styles.value}>
          {value}
        </Text>
        {subtitle && (
          <Text variant="labelMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </LinearGradient>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    padding: 16,
    gap: 6,
  },
  label: {
    color: "#cbd5f5",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  value: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  subtitle: {
    color: "#e2e8f0",
  },
});

export default StatCard;
