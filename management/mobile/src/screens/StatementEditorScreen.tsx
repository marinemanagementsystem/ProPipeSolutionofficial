import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Chip, Button } from '../components';
import {
  getStatementById,
  getStatementLines,
  createStatementLine,
  updateStatementLine,
  deleteStatementLine,
  closeStatement,
} from '../services/projects';
import { formatCurrency, formatDate } from '../utils/format';
import type { ProjectStatement, StatementLine, LineDirection } from '../types';
import type { ProjectsStackScreenProps } from '../navigation/types';

type Props = ProjectsStackScreenProps<'StatementEditor'>;

const StatementEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId, statementId } = route.params;
  const [statement, setStatement] = useState<ProjectStatement | null>(null);
  const [lines, setLines] = useState<StatementLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New line form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDirection, setNewDirection] = useState<LineDirection>('INCOME');
  const [newIsPaid, setNewIsPaid] = useState(true);
  const [addingLine, setAddingLine] = useState(false);

  const { colors } = useTheme();
  const { currentUserAuth, isAdmin } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const [statementData, linesData] = await Promise.all([
        getStatementById(statementId),
        getStatementLines(statementId),
      ]);
      setStatement(statementData);
      setLines(linesData);
    } catch (error) {
      console.error('Error loading statement:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddLine = async () => {
    if (!newDescription.trim() || !newAmount || parseFloat(newAmount) <= 0) {
      Alert.alert('Hata', 'Açıklama ve geçerli bir tutar girin.');
      return;
    }

    try {
      setAddingLine(true);
      const user = currentUserAuth ? {
        uid: currentUserAuth.uid,
        email: currentUserAuth.email || undefined,
        displayName: currentUserAuth.displayName || undefined,
      } : undefined;

      await createStatementLine(
        statementId,
        {
          description: newDescription.trim(),
          amount: parseFloat(newAmount),
          direction: newDirection,
          isPaid: newDirection === 'EXPENSE' ? newIsPaid : true,
        },
        user
      );

      setNewDescription('');
      setNewAmount('');
      setNewDirection('INCOME');
      setNewIsPaid(true);
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('Error adding line:', error);
      Alert.alert('Hata', 'Satır eklenirken bir hata oluştu.');
    } finally {
      setAddingLine(false);
    }
  };

  const handleDeleteLine = (lineId: string) => {
    Alert.alert(
      'Satırı Sil',
      'Bu satırı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = currentUserAuth ? {
                uid: currentUserAuth.uid,
                email: currentUserAuth.email || undefined,
                displayName: currentUserAuth.displayName || undefined,
              } : undefined;
              await deleteStatementLine(statementId, lineId, user);
              loadData();
            } catch (error) {
              console.error('Error deleting line:', error);
              Alert.alert('Hata', 'Satır silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleCloseStatement = () => {
    Alert.alert(
      'Hakedişi Kapat',
      'Bu hakedişi kapatmak istediğinizden emin misiniz? Kapatılan hakedişler düzenlenemez.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kasaya Aktar',
          onPress: async () => {
            try {
              const user = currentUserAuth ? {
                uid: currentUserAuth.uid,
                email: currentUserAuth.email || undefined,
                displayName: currentUserAuth.displayName || undefined,
              } : undefined;
              await closeStatement(statementId, projectId, 'TRANSFERRED_TO_SAFE', user);
              loadData();
              Alert.alert('Başarılı', 'Hakediş kapatıldı ve bakiye kasaya aktarıldı.');
            } catch (error) {
              console.error('Error closing statement:', error);
              Alert.alert('Hata', 'Hakediş kapatılırken bir hata oluştu.');
            }
          },
        },
        {
          text: 'Devret',
          onPress: async () => {
            try {
              const user = currentUserAuth ? {
                uid: currentUserAuth.uid,
                email: currentUserAuth.email || undefined,
                displayName: currentUserAuth.displayName || undefined,
              } : undefined;
              await closeStatement(statementId, projectId, 'CARRIED_OVER', user);
              loadData();
              Alert.alert('Başarılı', 'Hakediş kapatıldı ve bakiye devredildi.');
            } catch (error) {
              console.error('Error closing statement:', error);
              Alert.alert('Hata', 'Hakediş kapatılırken bir hata oluştu.');
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

  if (!statement) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Hakediş bulunamadı</Text>
      </View>
    );
  }

  const isDraft = statement.status === 'DRAFT';
  const incomeLines = lines.filter(l => l.direction === 'INCOME');
  const expenseLines = lines.filter(l => l.direction === 'EXPENSE');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.content}>
        {/* Statement Header */}
        <Card style={styles.headerCard} variant="elevated">
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.statementTitle, { color: colors.text }]}>{statement.title}</Text>
              <Text style={[styles.statementDate, { color: colors.textSecondary }]}>
                {formatDate(statement.date)}
              </Text>
            </View>
            <Chip
              label={isDraft ? 'Taslak' : 'Kapalı'}
              variant={isDraft ? 'warning' : 'success'}
            />
          </View>
        </Card>

        {/* Summary Card */}
        <Card style={styles.summaryCard} variant="outlined">
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Önceki Bakiye</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(statement.previousBalance)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Net Sonuç</Text>
              <Text style={[styles.summaryValue, { color: statement.totals.netCashReal >= 0 ? colors.success : colors.error }]}>
                {formatCurrency(statement.totals.netCashReal)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Son Bakiye</Text>
              <Text style={[styles.summaryValue, { color: statement.finalBalance >= 0 ? colors.success : colors.error, fontWeight: '700' }]}>
                {formatCurrency(statement.finalBalance)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Income Lines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>
              Gelirler ({formatCurrency(statement.totals.totalIncome)})
            </Text>
          </View>
          {incomeLines.map((line) => (
            <Card key={line.id} style={styles.lineCard} variant="outlined">
              <View style={styles.lineRow}>
                <Text style={[styles.lineDesc, { color: colors.text }]}>{line.description}</Text>
                <Text style={[styles.lineAmount, { color: colors.success }]}>
                  +{formatCurrency(line.amount)}
                </Text>
                {isDraft && isAdmin && (
                  <TouchableOpacity onPress={() => handleDeleteLine(line.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Expense Lines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              Giderler ({formatCurrency(statement.totals.totalExpensePaid + statement.totals.totalExpenseUnpaid)})
            </Text>
          </View>
          {expenseLines.map((line) => (
            <Card key={line.id} style={styles.lineCard} variant="outlined">
              <View style={styles.lineRow}>
                <View style={styles.lineInfo}>
                  <Text style={[styles.lineDesc, { color: colors.text }]}>{line.description}</Text>
                  <Chip
                    label={line.isPaid ? 'Ödendi' : 'Ödenmedi'}
                    variant={line.isPaid ? 'success' : 'warning'}
                    size="small"
                  />
                </View>
                <Text style={[styles.lineAmount, { color: colors.error }]}>
                  -{formatCurrency(line.amount)}
                </Text>
                {isDraft && isAdmin && (
                  <TouchableOpacity onPress={() => handleDeleteLine(line.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Add Line Form */}
        {isDraft && isAdmin && (
          <View style={styles.section}>
            {showAddForm ? (
              <Card style={styles.addFormCard} variant="outlined">
                <Text style={[styles.addFormTitle, { color: colors.text }]}>Yeni Satır Ekle</Text>

                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                  placeholder="Açıklama"
                  placeholderTextColor={colors.textTertiary}
                  value={newDescription}
                  onChangeText={setNewDescription}
                />

                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                  placeholder="Tutar"
                  placeholderTextColor={colors.textTertiary}
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="decimal-pad"
                />

                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[styles.optionButton, { backgroundColor: newDirection === 'INCOME' ? colors.success : colors.surfaceVariant }]}
                    onPress={() => setNewDirection('INCOME')}
                  >
                    <Text style={{ color: newDirection === 'INCOME' ? '#fff' : colors.text }}>Gelir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, { backgroundColor: newDirection === 'EXPENSE' ? colors.error : colors.surfaceVariant }]}
                    onPress={() => setNewDirection('EXPENSE')}
                  >
                    <Text style={{ color: newDirection === 'EXPENSE' ? '#fff' : colors.text }}>Gider</Text>
                  </TouchableOpacity>
                </View>

                {newDirection === 'EXPENSE' && (
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[styles.optionButton, { backgroundColor: newIsPaid ? colors.success : colors.surfaceVariant }]}
                      onPress={() => setNewIsPaid(true)}
                    >
                      <Text style={{ color: newIsPaid ? '#fff' : colors.text }}>Ödendi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.optionButton, { backgroundColor: !newIsPaid ? colors.warning : colors.surfaceVariant }]}
                      onPress={() => setNewIsPaid(false)}
                    >
                      <Text style={{ color: !newIsPaid ? '#fff' : colors.text }}>Ödenmedi</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.formActions}>
                  <Button title="İptal" onPress={() => setShowAddForm(false)} variant="outline" size="small" />
                  <Button title="Ekle" onPress={handleAddLine} loading={addingLine} size="small" />
                </View>
              </Card>
            ) : (
              <Button
                title="Satır Ekle"
                onPress={() => setShowAddForm(true)}
                variant="outline"
                icon={<Ionicons name="add" size={18} color={colors.primary} />}
              />
            )}
          </View>
        )}

        {/* Close Statement Button */}
        {isDraft && isAdmin && (
          <Button
            title="Hakedişi Kapat"
            onPress={handleCloseStatement}
            variant="success"
            size="large"
            style={{ marginTop: 16, marginBottom: 32 }}
          />
        )}
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
  headerCard: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statementTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statementDate: {
    fontSize: 13,
    marginTop: 2,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  lineCard: {
    marginBottom: 8,
    padding: 12,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lineInfo: {
    flex: 1,
    gap: 4,
  },
  lineDesc: {
    flex: 1,
    fontSize: 14,
  },
  lineAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  addFormCard: {
    padding: 16,
  },
  addFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});

export default StatementEditorScreen;
