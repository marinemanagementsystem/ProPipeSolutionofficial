import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../theme';

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  date: Timestamp;
  category?: string;
}

const typeLabels: Record<string, string> = {
  COMPANY_OFFICIAL: 'Şirket Resmi',
  PERSONAL: 'Kişisel',
  ADVANCE: 'Avans',
};

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'TRAVEL': 'airplane-outline',
  'FOOD': 'restaurant-outline',
  'TRANSPORT': 'car-outline',
  'MATERIAL': 'cube-outline',
  'SERVICE': 'construct-outline',
  'OTHER': 'ellipsis-horizontal-outline',
};

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data: Expense[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        if (!docData.isDeleted) {
          data.push({
            id: doc.id,
            ...docData,
          } as Expense);
        }
      });
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Hata', 'Giderler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  }, []);

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    const symbols: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' };
    return `${symbols[currency] || '₺'}${amount.toLocaleString('tr-TR')}`;
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity style={styles.expenseCard}>
      <View style={[styles.iconContainer, { 
        backgroundColor: item.status === 'PAID' ? `${colors.success}15` : `${colors.warning}15` 
      }]}>
        <Ionicons 
          name={categoryIcons[item.category || 'OTHER'] || 'receipt-outline'} 
          size={24} 
          color={item.status === 'PAID' ? colors.success : colors.warning} 
        />
      </View>
      
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.expenseMeta}>
          <Text style={styles.expenseType}>{typeLabels[item.type] || item.type}</Text>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
      
      <View style={styles.expenseRight}>
        <Text style={[styles.expenseAmount, { 
          color: item.status === 'PAID' ? colors.success : colors.text 
        }]}>
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === 'PAID' ? `${colors.success}15` : `${colors.warning}15`
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === 'PAID' ? colors.success : colors.warning
          }]}>
            {item.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unpaidAmount = expenses.filter(e => e.status !== 'PAID').reduce((sum, e) => sum + e.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giderler</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Toplam</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: `${colors.warning}10` }]}>
          <Text style={styles.summaryLabel}>Bekleyen</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            {formatCurrency(unpaidAmount)}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>Henüz gider kaydı yok</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expenseType: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  expenseDate: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
