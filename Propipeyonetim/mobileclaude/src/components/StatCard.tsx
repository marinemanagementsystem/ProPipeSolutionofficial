import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { SIZES, SHADOWS, COLORS } from "../theme";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  onPress?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
  onPress,
  trend
}) => {
  const { theme } = useTheme();

  const getGradientColors = (): [string, string, string] => {
    const gradients: Record<string, [string, string, string]> = {
      primary: COLORS.gradient.primary as [string, string, string],
      secondary: COLORS.gradient.secondary as [string, string, string],
      success: COLORS.gradient.success as [string, string, string],
      warning: ["#d97706", "#f59e0b", "#fbbf24"],
      error: ["#dc2626", "#ef4444", "#f87171"],
      info: ["#2563eb", "#3b82f6", "#60a5fa"]
    };
    return gradients[color] || gradients.primary;
  };

  const CardContent = (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={20} color="rgba(255,255,255,0.9)" />
            </View>
          )}
        </View>

        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>

        <View style={styles.footer}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons
                name={trend.isPositive ? "arrow-up" : "arrow-down"}
                size={12}
                color={trend.isPositive ? "#10b981" : "#ef4444"}
              />
              <Text
                style={[
                  styles.trendValue,
                  { color: trend.isPositive ? "#10b981" : "#ef4444" }
                ]}
              >
                %{Math.abs(trend.value).toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, SHADOWS.medium]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, SHADOWS.medium]}>{CardContent}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radiusLg,
    overflow: "hidden",
    minHeight: 120
  },
  gradient: {
    flex: 1,
    padding: SIZES.md
  },
  content: {
    flex: 1,
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  title: {
    fontSize: SIZES.fontMd,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    flex: 1
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  value: {
    fontSize: SIZES.font3xl,
    color: "#ffffff",
    fontWeight: "700",
    marginVertical: SIZES.xs
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  subtitle: {
    fontSize: SIZES.fontSm,
    color: "rgba(255,255,255,0.7)"
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  trendValue: {
    fontSize: SIZES.fontXs,
    fontWeight: "600",
    marginLeft: 2
  }
});
