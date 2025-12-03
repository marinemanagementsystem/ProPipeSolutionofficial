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
    <Surface style={styles.card} elevation={0}>
      <LinearGradient
        colors={[`${accent}dd`, "#0b1226"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text variant="labelSmall" style={styles.label}>
            {title}
          </Text>
        </View>
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  gradient: {
    padding: 16,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#dbeafe",
    letterSpacing: 0.6,
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
