import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { Card, Chip, EmptyState } from '../components';
import { getExpenses } from '../services/expenses';
import { getExpenseTypeLabel, getExpenseStatusLabel } from '../services/dashboard';
import { formatCurrency, formatDate } from '../utils/format';
import type { Expense } from '../types';
import type { ExpensesStackScreenProps } from '../navigation/types';

const ExpensesScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  const { colors } = useTheme();
  const navigation = useNavigation<ExpensesStackScreenProps<'ExpensesList'>['navigation']>();

  const loadExpenses = useCallback(async () => {
    try {
      const status = filter === 'ALL' ? undefined : filter;
      const data = await getExpenses(null, null, undefined, status);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.expenseCard} variant="outlined">
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <Text style={[styles.expenseDesc, { color: colors.text }]} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={[styles.expenseDate, { color: colors.textTertiary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={styles.expenseAmountContainer}>
            <Text
              style={[
                styles.expenseAmount,
                { color: item.status === 'PAID' ? colors.text : colors.warning },
              ]}
            >
              {formatCurrency(item.amount, item.currency)}
            </Text>
          </View>
        </View>
        <View style={styles.expenseFooter}>
          <Chip
            label={getExpenseTypeLabel(item.type)}
            variant={item.type === 'COMPANY_OFFICIAL' ? 'primary' : item.type === 'PERSONAL' ? 'info' : 'warning'}
            size="small"
          />
          <Chip
            label={getExpenseStatusLabel(item.status)}
            variant={item.status === 'PAID' ? 'success' : 'warning'}
            size="small"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      {(['ALL', 'PAID', 'UNPAID'] as const).map((f) => (
        <TouchableOpacity
          key={f}
          style={[
            styles.filterButton,
            {
              backgroundColor: filter === f ? colors.primary : colors.surfaceVariant,
              borderColor: filter === f ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setFilter(f)}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === f ? '#0f172a' : colors.textSecondary },
            ]}
          >
            {f === 'ALL' ? 'Tümü' : f === 'PAID' ? 'Ödendi' : 'Ödenmedi'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Gider bulunamadı"
            description="Henüz kayıtlı gider yok veya filtreye uygun gider bulunamadı."
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('ExpenseForm', {})}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#0f172a" />
      </TouchableOpacity>
    </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  expenseCard: {
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseDesc: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  expenseDate: {
    fontSize: 12,
    marginTop: 4,
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default ExpensesScreen;
