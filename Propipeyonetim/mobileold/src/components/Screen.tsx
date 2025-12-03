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
import { Text, useTheme } from "react-native-paper";

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
  const theme = useTheme();
  const isDark = scheme === "dark";

  const gradientColors = isDark
    ? ["#050b18", "#0b1224", "#0f172a"]
    : ["#e6f0ff", "#f3f7ff", "#ffffff"];

  return (
    <LinearGradient colors={gradientColors} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
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
              <Text variant="labelSmall" style={[styles.kicker, { color: theme.colors.secondary }]}>
                PRO PIPE | STEEL
              </Text>
              <Text
                variant="headlineSmall"
                style={[styles.title, { color: theme.colors.onBackground }]}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.subtitle,
                    { color: isDark ? "#cbd5e1" : "#5b6474" },
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
  },
  headerText: { flex: 1, gap: 4 },
  kicker: {
    letterSpacing: 1.2,
  },
  title: {
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: "#5b6474",
  },
});

export default Screen;
