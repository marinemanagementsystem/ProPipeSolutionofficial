import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardSummary, fetchLatestExpenses, fetchUpcomingNetworkActions } from '../services/dashboard';
import { formatCurrency, formatDate } from '../utils/format';
import { colors, darkColors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../theme';
import type { DashboardSummary, Expense, NetworkAction } from '../types';

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const themeColors = isDark ? darkColors : colors;
  
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [latestExpenses, setLatestExpenses] = useState<Expense[]>([]);
  const [networkActions, setNetworkActions] = useState<NetworkAction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, expensesData, networkData] = await Promise.all([
        fetchDashboardSummary(),
        fetchLatestExpenses(5),
        fetchUpcomingNetworkActions(),
      ]);
      setStats(summaryData);
      setLatestExpenses(expensesData);
      setNetworkActions(networkData.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color,
    subtitle 
  }: { 
    title: string; 
    value: string; 
    icon: keyof typeof Ionicons.glyphMap; 
    color: string;
    subtitle?: string;
  }) => (
    <View style={[styles.statCard, { 
      backgroundColor: themeColors.surface,
      borderLeftColor: color 
    }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statTitle, { color: themeColors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={[styles.statSubtitle, { color: themeColors.textLight }]}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: themeColors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Veriler yükleniyor...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[themeColors.primary, themeColors.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Merhaba,</Text>
            <Text style={styles.userName}>{userProfile?.displayName || 'Kullanıcı'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
      >
        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Genel Bakış</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Şirket Kasası"
            value={formatCurrency(stats?.companySafeBalance || 0)}
            icon="wallet-outline"
            color={themeColors.primary}
          />
          <StatCard
            title="Tersane Bakiyesi"
            value={formatCurrency(stats?.totalProjectsBalance || 0)}
            icon="business-outline"
            color={colors.success}
            subtitle={`${stats?.totalProjectsCount || 0} tersane`}
          />
          <StatCard
            title="Bu Ay Ödenen"
            value={formatCurrency(stats?.totalPaidExpensesThisMonth || 0)}
            icon="checkmark-circle-outline"
            color={colors.secondary}
          />
          <StatCard
            title="Bekleyen Ödemeler"
            value={formatCurrency(stats?.unpaidExpenses || 0)}
            icon="time-outline"
            color={colors.warning}
          />
        </View>

        {/* Latest Expenses */}
        {latestExpenses.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Son Giderler</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: themeColors.primary }]}>Tümü</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
              {latestExpenses.map((expense, index) => (
                <View 
                  key={expense.id} 
                  style={[
                    styles.expenseItem,
                    index < latestExpenses.length - 1 && { 
                      borderBottomWidth: 1, 
                      borderBottomColor: themeColors.border 
                    }
                  ]}
                >
                  <View style={[styles.expenseIcon, { 
                    backgroundColor: expense.status === 'PAID' ? `${colors.success}15` : `${colors.warning}15` 
                  }]}>
                    <Ionicons 
                      name={expense.status === 'PAID' ? 'checkmark-circle' : 'time'} 
                      size={18} 
                      color={expense.status === 'PAID' ? colors.success : colors.warning} 
                    />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={[styles.expenseDesc, { color: themeColors.text }]} numberOfLines={1}>
                      {expense.description}
                    </Text>
                    <Text style={[styles.expenseDate, { color: themeColors.textLight }]}>
                      {formatDate(expense.date)}
                    </Text>
                  </View>
                  <Text style={[styles.expenseAmount, { 
                    color: expense.status === 'PAID' ? colors.success : themeColors.text 
                  }]}>
                    {formatCurrency(expense.amount, expense.currency)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Network Actions */}
        {networkActions.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Yaklaşan Görüşmeler</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: themeColors.primary }]}>Tümü</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
              {networkActions.map((action, index) => (
                <View 
                  key={action.id} 
                  style={[
                    styles.networkItem,
                    index < networkActions.length - 1 && { 
                      borderBottomWidth: 1, 
                      borderBottomColor: themeColors.border 
                    }
                  ]}
                >
                  <View style={[styles.networkIcon, { 
                    backgroundColor: action.isOverdue ? `${colors.error}15` : `${themeColors.primary}15` 
                  }]}>
                    <Ionicons 
                      name={action.isOverdue ? 'alert-circle' : 'business'} 
                      size={18} 
                      color={action.isOverdue ? colors.error : themeColors.primary} 
                    />
                  </View>
                  <View style={styles.networkInfo}>
                    <Text style={[styles.networkName, { color: themeColors.text }]} numberOfLines={1}>
                      {action.companyName}
                    </Text>
                    <Text style={[styles.networkContact, { color: themeColors.textLight }]}>
                      {action.contactPerson || 'Kişi belirtilmemiş'}
                    </Text>
                  </View>
                  <View style={styles.networkRight}>
                    <Text style={[styles.networkDate, { 
                      color: action.isOverdue ? colors.error : themeColors.textSecondary 
                    }]}>
                      {formatDate(action.nextActionDate)}
                    </Text>
                    {action.isOverdue && (
                      <View style={styles.overdueBadge}>
                        <Text style={styles.overdueText}>Gecikmiş</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Hızlı İşlemler</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.actionIcon, { backgroundColor: `${themeColors.primary}15` }]}>
              <Ionicons name="add-circle-outline" size={28} color={themeColors.primary} />
            </View>
            <Text style={[styles.actionText, { color: themeColors.text }]}>Yeni Gider</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.actionIcon, { backgroundColor: `${colors.success}15` }]}>
              <Ionicons name="document-text-outline" size={28} color={colors.success} />
            </View>
            <Text style={[styles.actionText, { color: themeColors.text }]}>Rapor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.actionIcon, { backgroundColor: `${colors.warning}15` }]}>
              <Ionicons name="stats-chart-outline" size={28} color={colors.warning} />
            </View>
            <Text style={[styles.actionText, { color: themeColors.text }]}>İstatistik</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  statsGrid: {
    gap: spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadow.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statSubtitle: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  card: {
    borderRadius: borderRadius.lg,
    ...shadow.sm,
    overflow: 'hidden',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  expenseIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDesc: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  expenseDate: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  networkIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  networkContact: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  networkRight: {
    alignItems: 'flex-end',
  },
  networkDate: {
    fontSize: fontSize.xs,
  },
  overdueBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: 4,
  },
  overdueText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});
