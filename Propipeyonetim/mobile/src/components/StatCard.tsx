import React from "react";
import { StyleSheet, View, Text, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fontSize, fontWeight, borderRadius } from "../theme";

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
  accent = colors.primary,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const gradientColors: [string, string] = isDark
    ? [`${accent}dd`, "#0b1226"]
    : [`${accent}`, `${accent}cc`];

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.label}>
            {title}
          </Text>
        </View>
        <Text style={styles.value}>
          {value}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: "#dbeafe",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  value: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: "#f8fafc",
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: "#e2e8f0",
  },
});

export default StatCard;
