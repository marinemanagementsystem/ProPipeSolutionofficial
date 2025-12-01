import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Vibration,
} from "react-native";
import {
  ActivityIndicator,
  Chip,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import {
  DashboardSummary,
  fetchDashboardSummary,
  fetchLatestExpenses,
  fetchUpcomingNetworkActions,
} from "../services/dashboard";
import StatCard from "../components/StatCard";
import { formatCurrency, formatDate } from "../utils/format";
import type { Expense, NetworkAction } from "../types";

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [latestExpenses, setLatestExpenses] = useState<Expense[]>([]);
  const [networkActions, setNetworkActions] = useState<NetworkAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [summaryData, expensesData, networkData] = await Promise.all([
        fetchDashboardSummary(),
        fetchLatestExpenses(5),
        fetchUpcomingNetworkActions(),
      ]);
      setSummary(summaryData);
      setLatestExpenses(expensesData);
      setNetworkActions(networkData);
    } catch (err) {
      console.error("Dashboard yüklenemedi", err);
      setError("Veriler alınamadı");
      Vibration.vibrate(120);
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

  const renderExpenses = () => (
    <Surface style={styles.section} elevation={1}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Son Giderler
        </Text>
        <Chip compact>{latestExpenses.length} kayıt</Chip>
      </View>
      {latestExpenses.map((expense) => (
        <View key={expense.id} style={styles.listItem}>
          <View>
            <Text variant="titleSmall">{expense.description}</Text>
            <Text style={styles.muted}>{formatDate(expense.date)}</Text>
          </View>
          <View style={styles.alignRight}>
            <Text
              variant="titleMedium"
              style={{
                color:
                  expense.status === "PAID"
                    ? theme.colors.tertiary
                    : theme.colors.error,
              }}
            >
              {formatCurrency(expense.amount, expense.currency || "TRY")}
            </Text>
            <Text style={styles.badge}>{expense.status}</Text>
          </View>
        </View>
      ))}
      {latestExpenses.length === 0 && (
        <Text style={styles.muted}>Gösterilecek gider yok</Text>
      )}
    </Surface>
  );

  const renderNetwork = () => (
    <Surface style={styles.section} elevation={1}>
      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Yaklaşan Görüşmeler
        </Text>
        <Chip compact>{networkActions.length} takip</Chip>
      </View>
      {networkActions.map((item) => (
        <View key={item.id} style={styles.listItem}>
          <View>
            <Text variant="titleSmall">{item.companyName}</Text>
            <Text style={styles.muted}>{item.contactPerson}</Text>
          </View>
          <View style={styles.alignRight}>
            <Text
              style={[
                styles.badge,
                item.isOverdue && { color: theme.colors.error },
              ]}
            >
              {item.nextActionDate
                ? formatDate(item.nextActionDate)
                : "Takip yok"}
            </Text>
            {item.category && (
              <Text style={styles.muted}>{item.category}</Text>
            )}
          </View>
        </View>
      ))}
      {networkActions.length === 0 && (
        <Text style={styles.muted}>Önümüzdeki 7 günde aksiyon yok</Text>
      )}
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={styles.muted}>Veriler hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error && (
        <Surface style={styles.section} elevation={1}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
        </Surface>
      )}

      {summary && (
        <View style={styles.statsGrid}>
          <StatCard
            title="Şirket Kasası"
            value={formatCurrency(
              summary.companySafeBalance,
              summary.currency || "TRY"
            )}
            subtitle="Güncel kasa durumu"
            accent="#2563eb"
          />
          <StatCard
            title="Tersane Bakiyesi"
            value={formatCurrency(
              summary.totalProjectsBalance,
              summary.currency || "TRY"
            )}
            subtitle={`${summary.totalProjectsCount} aktif tersane`}
            accent="#22d3ee"
          />
          <StatCard
            title="Bu Ay Ödenen"
            value={formatCurrency(
              summary.totalPaidExpensesThisMonth,
              summary.currency || "TRY"
            )}
            subtitle="Gider toplamı"
            accent="#0ea5e9"
          />
          <StatCard
            title="Ortak Bakiyesi"
            value={formatCurrency(
              summary.totalPartnersPositive - summary.totalPartnersNegative,
              summary.currency || "TRY"
            )}
            subtitle="Şirket / ortak dengesi"
            accent="#22c55e"
          />
        </View>
      )}

      {renderExpenses()}
      {renderNetwork()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontWeight: "700",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2937",
  },
  muted: {
    color: "#94a3b8",
  },
  badge: {
    color: "#e2e8f0",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});

export default HomeScreen;
