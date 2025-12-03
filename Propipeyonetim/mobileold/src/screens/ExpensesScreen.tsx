import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, Surface, Text, useTheme } from "react-native-paper";
import { fetchLatestExpenses } from "../services/dashboard";
import type { Expense } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import Screen from "../components/Screen";

const ExpensesScreen: React.FC = () => {
  const theme = useTheme();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cardStyle = [
    styles.card,
    styles.shadow,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLatestExpenses(20);
      setExpenses(data);
    } catch (err) {
      console.error("Expenses failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Giderler yukleniyor...</Text>
      </View>
    );
  }

  return (
    <Screen
      title="Giderler"
      subtitle="Son 20 hareket"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {expenses.map((expense) => (
        <Surface key={expense.id} style={cardStyle} elevation={0}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.title}>
                {expense.description}
              </Text>
              <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
                {formatDate(expense.date)}
              </Text>
            </View>
            <View style={styles.alignRight}>
              <Text variant="titleLarge">
                {formatCurrency(expense.amount, expense.currency || "TRY")}
              </Text>
              <Chip compact style={styles.chip}>
                {expense.status}
              </Chip>
            </View>
          </View>
        </Surface>
      ))}
      {expenses.length === 0 && (
        <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
          Henuz gider kaydi yok.
        </Text>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { fontWeight: "700" },
  muted: { color: "#94a3b8" },
  alignRight: { alignItems: "flex-end" },
  chip: { marginTop: 6 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default ExpensesScreen;
