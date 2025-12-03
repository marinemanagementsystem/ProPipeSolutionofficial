import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, StatCard, Card, Badge, EmptyState, LoadingScreen } from "../components";
import {
  getDashboardSummary,
  getLast6MonthsExpensesTrend,
  getUpcomingNetworkActions,
  getLatestExpenses
} from "../services";
import {
  DashboardSummary,
  ExpenseTrendItem,
  NetworkContact,
  Expense,
  getCategoryLabel
} from "../types";
import { formatCurrency, formatDate, getRelativeTime } from "../utils/format";
import { SIZES } from "../theme";

export const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserProfile } = useAuth();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expensesTrend, setExpensesTrend] = useState<ExpenseTrendItem[]>([]);
  const [upcomingActions, setUpcomingActions] = useState<NetworkContact[]>([]);
  const [latestExpenses, setLatestExpenses] = useState<Expense[]>([]);

  const loadData = async () => {
    try {
      const [summaryData, trend, actions, expenses] = await Promise.all([
        getDashboardSummary(),
        getLast6MonthsExpensesTrend(),
        getUpcomingNetworkActions(),
        getLatestExpenses(5)
      ]);

      setSummary(summaryData);
      setExpensesTrend(trend);
      setUpcomingActions(actions);
      setLatestExpenses(expenses);
    } catch (error) {
      console.error("Dashboard verisi yüklenemedi:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return <LoadingScreen message="Dashboard yükleniyor..." />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            {getGreeting()},
          </Text>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
            {currentUserProfile?.displayName || "Kullanıcı"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.notificationBtn, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsGrid}>
        <View style={styles.cardRow}>
          <View style={styles.cardHalf}>
            <StatCard
              title="Şirket Kasası"
              value={formatCurrency(summary?.companySafeBalance || 0)}
              icon="wallet-outline"
              color="primary"
            />
          </View>
          <View style={styles.cardHalf}>
            <StatCard
              title="Tersanelerde Bekleyen"
              value={formatCurrency(summary?.totalPendingInShipyards || 0)}
              icon="boat-outline"
              color="secondary"
            />
          </View>
        </View>

        <StatCard
          title="Bu Ay Ödenen Giderler"
          value={formatCurrency(summary?.thisMonthExpenses || 0)}
          icon="trending-down-outline"
          color="warning"
          subtitle={new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
        />
      </View>

      {/* Partner Balances */}
      {summary?.partnerNetBalances && summary.partnerNetBalances.length > 0 && (
        <Card
          title="Ortak Bakiyeleri"
          style={styles.section}
          headerRight={
            <TouchableOpacity onPress={() => navigation.navigate("Partners")}>
              <Text style={{ color: theme.colors.primary, fontSize: SIZES.fontSm }}>
                Tümü
              </Text>
            </TouchableOpacity>
          }
        >
          {summary.partnerNetBalances.map((partner, index) => (
            <View
              key={index}
              style={[
                styles.partnerRow,
                index < summary.partnerNetBalances.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border
                }
              ]}
            >
              <Text style={[styles.partnerName, { color: theme.colors.textPrimary }]}>
                {partner.name}
              </Text>
              <Text
                style={[
                  styles.partnerBalance,
                  {
                    color: partner.balance >= 0 ? theme.colors.success : theme.colors.error
                  }
                ]}
              >
                {formatCurrency(partner.balance)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Expense Trend */}
      {expensesTrend.length > 0 && (
        <Card title="Son 6 Ay Gider Trendi" style={styles.section}>
          <View style={styles.trendContainer}>
            {expensesTrend.map((item, index) => {
              const maxValue = Math.max(...expensesTrend.map(e => e.total));
              const height = maxValue > 0 ? (item.total / maxValue) * 80 : 0;
              return (
                <View key={index} style={styles.trendBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 4),
                        backgroundColor: theme.colors.primary
                      }
                    ]}
                  />
                  <Text style={[styles.trendLabel, { color: theme.colors.textTertiary }]}>
                    {item.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {/* Upcoming Network Actions */}
      {upcomingActions.length > 0 && (
        <Card
          title="Yaklaşan Aramalar"
          style={styles.section}
          headerRight={
            <TouchableOpacity onPress={() => navigation.navigate("Network")}>
              <Text style={{ color: theme.colors.primary, fontSize: SIZES.fontSm }}>
                Tümü
              </Text>
            </TouchableOpacity>
          }
        >
          {upcomingActions.slice(0, 3).map((contact, index) => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.actionItem,
                index < Math.min(upcomingActions.length, 3) - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border
                }
              ]}
              onPress={() => navigation.navigate("Network")}
            >
              <View style={styles.actionContent}>
                <Text style={[styles.actionCompany, { color: theme.colors.textPrimary }]}>
                  {contact.companyName}
                </Text>
                <Text style={[styles.actionPerson, { color: theme.colors.textSecondary }]}>
                  {contact.contactPerson}
                </Text>
              </View>
              <Badge
                label={getCategoryLabel(contact.category)}
                variant="info"
                size="small"
              />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Latest Expenses */}
      {latestExpenses.length > 0 && (
        <Card
          title="Son Giderler"
          style={styles.section}
          headerRight={
            <TouchableOpacity onPress={() => navigation.navigate("Expenses")}>
              <Text style={{ color: theme.colors.primary, fontSize: SIZES.fontSm }}>
                Tümü
              </Text>
            </TouchableOpacity>
          }
        >
          {latestExpenses.map((expense, index) => (
            <View
              key={expense.id}
              style={[
                styles.expenseItem,
                index < latestExpenses.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border
                }
              ]}
            >
              <View style={styles.expenseContent}>
                <Text
                  style={[styles.expenseDesc, { color: theme.colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {expense.description}
                </Text>
                <Text style={[styles.expenseDate, { color: theme.colors.textTertiary }]}>
                  {getRelativeTime(expense.createdAt)}
                </Text>
              </View>
              <Text style={[styles.expenseAmount, { color: theme.colors.error }]}>
                -{formatCurrency(expense.amount, expense.currency)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      <View style={styles.bottomPadding} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg
  },
  greeting: {
    fontSize: SIZES.fontMd
  },
  userName: {
    fontSize: SIZES.font2xl,
    fontWeight: "700"
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  cardsGrid: {
    gap: SIZES.md,
    marginBottom: SIZES.md
  },
  cardRow: {
    flexDirection: "row",
    gap: SIZES.md
  },
  cardHalf: {
    flex: 1
  },
  section: {
    marginBottom: SIZES.md
  },
  partnerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.sm
  },
  partnerName: {
    fontSize: SIZES.fontMd,
    fontWeight: "500"
  },
  partnerBalance: {
    fontSize: SIZES.fontMd,
    fontWeight: "600"
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 120,
    paddingTop: SIZES.md
  },
  trendBar: {
    alignItems: "center",
    flex: 1
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: SIZES.xs
  },
  trendLabel: {
    fontSize: SIZES.fontXs
  },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.sm
  },
  actionContent: {
    flex: 1
  },
  actionCompany: {
    fontSize: SIZES.fontMd,
    fontWeight: "500"
  },
  actionPerson: {
    fontSize: SIZES.fontSm,
    marginTop: 2
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.sm
  },
  expenseContent: {
    flex: 1
  },
  expenseDesc: {
    fontSize: SIZES.fontMd,
    fontWeight: "500"
  },
  expenseDate: {
    fontSize: SIZES.fontSm,
    marginTop: 2
  },
  expenseAmount: {
    fontSize: SIZES.fontMd,
    fontWeight: "600"
  },
  bottomPadding: {
    height: SIZES.xxl
  }
});
