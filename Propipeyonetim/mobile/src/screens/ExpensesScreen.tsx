import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Chip, Surface, Text } from "react-native-paper";
import { fetchLatestExpenses } from "../services/dashboard";
import type { Expense } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

const ExpensesScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        <Text style={styles.muted}>Giderler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {expenses.map((expense) => (
        <Surface key={expense.id} style={styles.card} elevation={1}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.title}>
                {expense.description}
              </Text>
              <Text style={styles.muted}>{formatDate(expense.date)}</Text>
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
        <Text style={styles.muted}>Henüz gider kaydı yok.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#0f172a",
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
