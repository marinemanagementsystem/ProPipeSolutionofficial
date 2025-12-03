import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Chip } from '../components';
import {
  getDashboardSummary,
  getLatestExpenses,
  getUpcomingNetworkActions,
  getExpenseTypeLabel,
} from '../services/dashboard';
import { formatCurrency, formatDate } from '../utils/format';
import type { DashboardSummary, Expense } from '../types';
import type { NetworkActionItem } from '../services/dashboard';

const DashboardScreen: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [latestExpenses, setLatestExpenses] = useState<Expense[]>([]);
  const [networkActions, setNetworkActions] = useState<NetworkActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { currentUserProfile, logout } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();
  const navigation = useNavigation();

  const loadData = useCallback(async () => {
    try {
      const [summaryData, expenses, actions] = await Promise.all([
        getDashboardSummary(),
        getLatestExpenses(5),
        getUpcomingNetworkActions(),
      ]);

      setSummary(summaryData);
      setLatestExpenses(expenses);
      setNetworkActions(actions);
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hoş geldin,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {currentUserProfile?.displayName || 'Kullanıcı'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={toggleTheme}
          >
            <Ionicons
              name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="person-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          {/* Company Safe Balance */}
          <Card style={[styles.summaryCard, { flex: 1 }]} variant="elevated">
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Şirket Kasası</Text>
            <Text style={[styles.cardValue, { color: colors.success }]}>
              {formatCurrency(summary?.companySafeBalance || 0)}
            </Text>
          </Card>

          {/* Projects Balance */}
          <Card style={[styles.summaryCard, { flex: 1 }]} variant="elevated">
            <Ionicons name="business-outline" size={24} color={colors.info} />
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Tersaneler</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {formatCurrency(summary?.totalProjectsBalance || 0)}
            </Text>
            <Text style={[styles.cardSubtext, { color: colors.textTertiary }]}>
              {summary?.totalProjectsCount || 0} tersane
            </Text>
          </Card>
        </View>

        <View style={styles.summaryGrid}>
          {/* This Month Expenses */}
          <Card style={[styles.summaryCard, { flex: 1 }]} variant="elevated">
            <Ionicons name="receipt-outline" size={24} color={colors.warning} />
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Bu Ay Giderler</Text>
            <Text style={[styles.cardValue, { color: colors.warning }]}>
              {formatCurrency(summary?.totalPaidExpensesThisMonth || 0)}
            </Text>
          </Card>

          {/* Partners Balance */}
          <Card style={[styles.summaryCard, { flex: 1 }]} variant="elevated">
            <Ionicons name="people-outline" size={24} color={colors.error} />
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Ortak Borçları</Text>
            <Text style={[styles.cardValue, { color: colors.error }]}>
              {formatCurrency(summary?.totalPartnersNegative || 0)}
            </Text>
          </Card>
        </View>

        {/* Latest Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Giderler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExpensesTab' as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {latestExpenses.length === 0 ? (
            <Card variant="outlined">
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Henüz gider kaydı yok
              </Text>
            </Card>
          ) : (
            latestExpenses.map((expense) => (
              <Card key={expense.id} style={styles.expenseCard} variant="outlined">
                <View style={styles.expenseRow}>
                  <View style={styles.expenseInfo}>
                    <Text style={[styles.expenseDesc, { color: colors.text }]} numberOfLines={1}>
                      {expense.description}
                    </Text>
                    <Text style={[styles.expenseDate, { color: colors.textTertiary }]}>
                      {formatDate(expense.date)} • {getExpenseTypeLabel(expense.type)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.expenseAmount,
                      { color: expense.status === 'PAID' ? colors.text : colors.warning },
                    ]}
                  >
                    {formatCurrency(expense.amount)}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Network Actions */}
        {networkActions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Yaklaşan İşlemler</Text>
              <TouchableOpacity onPress={() => navigation.navigate('NetworkTab' as never)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>

            {networkActions.slice(0, 3).map((action) => (
              <Card key={action.id} style={styles.actionCard} variant="outlined">
                <View style={styles.actionRow}>
                  <View style={styles.actionInfo}>
                    <Text style={[styles.actionCompany, { color: colors.text }]}>
                      {action.companyName}
                    </Text>
                    <Text style={[styles.actionPerson, { color: colors.textSecondary }]}>
                      {action.contactPerson}
                    </Text>
                  </View>
                  <Chip
                    label={action.isOverdue ? 'Gecikmiş' : 'Yaklaşan'}
                    variant={action.isOverdue ? 'error' : 'warning'}
                    size="small"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 12,
  },
  expenseCard: {
    marginBottom: 8,
    padding: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionCard: {
    marginBottom: 8,
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
    marginRight: 12,
  },
  actionCompany: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionPerson: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default DashboardScreen;
