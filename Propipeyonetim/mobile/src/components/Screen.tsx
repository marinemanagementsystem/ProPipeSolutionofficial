import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { colors, fontSize, fontWeight } from "../theme";

type ScreenProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const Screen: React.FC<ScreenProps> = ({
  title,
  subtitle,
  right,
  children,
  refreshing,
  onRefresh,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const gradientColors: [string, string, string] = isDark
    ? ["#050b18", "#0b1224", "#0f172a"]
    : [colors.background, "#f3f7ff", "#ffffff"];

  return (
    <LinearGradient colors={gradientColors} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={[styles.kicker, { color: isDark ? colors.secondary : colors.primary }]}>
                PRO PIPE | STEEL
              </Text>
              <Text
                style={[styles.title, { color: isDark ? "#f8fafc" : colors.text }]}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: isDark ? "#cbd5e1" : colors.textSecondary },
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            {right}
          </View>
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  headerText: { flex: 1, gap: 4 },
  kicker: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: "#5b6474",
  },
});

export default Screen;
