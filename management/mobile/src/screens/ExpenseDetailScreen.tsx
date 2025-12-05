import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Chip, Button } from '../components';
import { getExpenseById, deleteExpense } from '../services/expenses';
import { getExpenseTypeLabel, getExpenseStatusLabel, getPaymentMethodLabel } from '../services/dashboard';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';
import type { Expense } from '../types';
import type { ExpensesStackScreenProps } from '../navigation/types';

type Props = ExpensesStackScreenProps<'ExpenseDetail'>;

const ExpenseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { colors } = useTheme();
  const { currentUserAuth, isAdmin } = useAuth();

  useEffect(() => {
    loadExpense();
  }, [expenseId]);

  const loadExpense = async () => {
    try {
      const data = await getExpenseById(expenseId);
      setExpense(data);
    } catch (error) {
      console.error('Error loading expense:', error);
      Alert.alert('Hata', 'Gider yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Gideri Sil',
      'Bu gideri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteExpense(expenseId, currentUserAuth ? {
                uid: currentUserAuth.uid,
                email: currentUserAuth.email,
                displayName: currentUserAuth.displayName,
              } : undefined);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Hata', 'Gider silinirken bir hata oluştu.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Gider bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Amount Card */}
        <Card style={styles.amountCard} variant="elevated">
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Tutar</Text>
          <Text style={[styles.amountValue, { color: expense.status === 'PAID' ? colors.success : colors.warning }]}>
            {formatCurrency(expense.amount, expense.currency)}
          </Text>
          <View style={styles.statusRow}>
            <Chip
              label={getExpenseStatusLabel(expense.status)}
              variant={expense.status === 'PAID' ? 'success' : 'warning'}
            />
            <Chip
              label={getExpenseTypeLabel(expense.type)}
              variant={expense.type === 'COMPANY_OFFICIAL' ? 'primary' : expense.type === 'PERSONAL' ? 'info' : 'warning'}
            />
          </View>
        </Card>

        {/* Details */}
        <Card style={styles.detailsCard} variant="outlined">
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Açıklama</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{expense.description}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tarih</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(expense.date)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Ödeme Yöntemi</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{getPaymentMethodLabel(expense.paymentMethod)}</Text>
            </View>
          </View>

          {expense.category && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Kategori</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{expense.category}</Text>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Receipt Image */}
        {expense.receiptUrl && (
          <Card style={styles.receiptCard} variant="outlined">
            <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Fiş/Fatura</Text>
            <Image
              source={{ uri: expense.receiptUrl }}
              style={styles.receiptImage}
              resizeMode="cover"
            />
          </Card>
        )}

        {/* Metadata */}
        <Card style={styles.metaCard} variant="outlined">
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
            Oluşturan: {expense.createdByDisplayName || expense.createdByEmail || 'Bilinmiyor'}
          </Text>
          <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
            Oluşturulma: {formatDateTime(expense.createdAt)}
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Düzenle"
            onPress={() => navigation.navigate('ExpenseForm', { expenseId: expense.id })}
            variant="primary"
            style={{ flex: 1 }}
          />
          {isAdmin && (
            <Button
              title="Sil"
              onPress={handleDelete}
              variant="danger"
              loading={deleting}
              style={{ flex: 1 }}
            />
          )}
        </View>
      </View>
    </ScrollView>
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
  errorText: {
    fontSize: 16,
    marginTop: 12,
  },
  content: {
    padding: 16,
  },
  amountCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  receiptCard: {
    marginBottom: 16,
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  metaCard: {
    marginBottom: 16,
    padding: 12,
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
});

export default ExpenseDetailScreen;
