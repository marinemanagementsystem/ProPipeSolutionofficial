import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card } from '../components';
import {
  createPartnerStatement,
  updatePartnerStatement,
  getPartnerStatementById,
  getSuggestedPreviousBalance,
  closePartnerStatement,
  reopenPartnerStatement,
} from '../services/partners';
import { formatCurrency, getMonthName } from '../utils/format';
import type { PartnersStackScreenProps } from '../navigation/types';

type Props = PartnersStackScreenProps<'PartnerStatementForm'>;

const PartnerStatementFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { partnerId, statementId } = route.params;
  const isEditing = !!statementId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [previousBalance, setPreviousBalance] = useState('0');
  const [previousBalanceEditable, setPreviousBalanceEditable] = useState(true);
  const [personalExpenseReimbursement, setPersonalExpenseReimbursement] = useState('0');
  const [monthlySalary, setMonthlySalary] = useState('0');
  const [profitShare, setProfitShare] = useState('0');
  const [actualWithdrawn, setActualWithdrawn] = useState('0');
  const [note, setNote] = useState('');

  const { colors } = useTheme();
  const { currentUserAuth, isAdmin } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      if (isEditing && statementId) {
        const statement = await getPartnerStatementById(statementId);
        if (statement) {
          setMonth(statement.month);
          setYear(statement.year);
          setPreviousBalance(statement.previousBalance.toString());
          setPersonalExpenseReimbursement(statement.personalExpenseReimbursement.toString());
          setMonthlySalary(statement.monthlySalary.toString());
          setProfitShare(statement.profitShare.toString());
          setActualWithdrawn(statement.actualWithdrawn.toString());
          setNote(statement.note || '');
          setIsClosed(statement.status === 'CLOSED');
        }
      } else {
        // Get suggested previous balance
        const suggested = await getSuggestedPreviousBalance(partnerId);
        setPreviousBalance(suggested.value.toString());
        setPreviousBalanceEditable(suggested.isEditable);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Calculate next month balance
  const calculateNextBalance = () => {
    const prev = parseFloat(previousBalance) || 0;
    const expense = parseFloat(personalExpenseReimbursement) || 0;
    const salary = parseFloat(monthlySalary) || 0;
    const profit = parseFloat(profitShare) || 0;
    const withdrawn = parseFloat(actualWithdrawn) || 0;

    const hakEdis = expense + salary + profit;
    return prev + withdrawn - hakEdis;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = {
        month,
        year,
        previousBalance: parseFloat(previousBalance) || 0,
        personalExpenseReimbursement: parseFloat(personalExpenseReimbursement) || 0,
        monthlySalary: parseFloat(monthlySalary) || 0,
        profitShare: parseFloat(profitShare) || 0,
        actualWithdrawn: parseFloat(actualWithdrawn) || 0,
        note: note.trim() || undefined,
      };

      const user = currentUserAuth ? {
        uid: currentUserAuth.uid,
        email: currentUserAuth.email || '',
        displayName: currentUserAuth.displayName || undefined,
      } : undefined;

      if (isEditing && statementId) {
        await updatePartnerStatement(statementId, formData, user);
      } else {
        await createPartnerStatement(partnerId, formData, user);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving statement:', error);
      Alert.alert('Hata', 'Dönem kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    Alert.alert(
      'Dönemi Kapat',
      'Bu dönemi kapatmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kapat',
          onPress: async () => {
            try {
              setLoading(true);
              const user = currentUserAuth ? {
                uid: currentUserAuth.uid,
                email: currentUserAuth.email || '',
                displayName: currentUserAuth.displayName || undefined,
              } : undefined;
              await closePartnerStatement(statementId!, user);
              setIsClosed(true);
              Alert.alert('Başarılı', 'Dönem kapatıldı.');
            } catch (error) {
              console.error('Error closing statement:', error);
              Alert.alert('Hata', 'Dönem kapatılırken bir hata oluştu.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReopen = async () => {
    Alert.alert(
      'Dönemi Yeniden Aç',
      'Bu dönemi tekrar açmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Aç',
          onPress: async () => {
            try {
              setLoading(true);
              const user = currentUserAuth ? {
                uid: currentUserAuth.uid,
                email: currentUserAuth.email || '',
                displayName: currentUserAuth.displayName || undefined,
              } : undefined;
              await reopenPartnerStatement(statementId!, user);
              setIsClosed(false);
              Alert.alert('Başarılı', 'Dönem yeniden açıldı.');
            } catch (error) {
              console.error('Error reopening statement:', error);
              Alert.alert('Hata', 'Dönem açılırken bir hata oluştu.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const nextBalance = calculateNextBalance();

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i),
  }));

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Period Selection */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Dönem</Text>
        <View style={styles.periodRow}>
          <View style={[styles.monthSelector, { borderColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {months.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[
                    styles.monthButton,
                    {
                      backgroundColor: month === m.value ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setMonth(m.value)}
                  disabled={isClosed}
                >
                  <Text style={{ color: month === m.value ? '#0f172a' : colors.text, fontSize: 12 }}>
                    {m.label.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <Input
            placeholder="Yıl"
            value={year.toString()}
            onChangeText={(v) => setYear(parseInt(v) || currentDate.getFullYear())}
            keyboardType="number-pad"
            editable={!isClosed}
            containerStyle={{ width: 80, marginBottom: 0 }}
          />
        </View>

        <Input
          label="Önceki Bakiye"
          placeholder="0"
          value={previousBalance}
          onChangeText={setPreviousBalance}
          keyboardType="decimal-pad"
          editable={previousBalanceEditable && !isClosed}
        />

        <Input
          label="Kişisel Gider Karşılığı"
          placeholder="0"
          value={personalExpenseReimbursement}
          onChangeText={setPersonalExpenseReimbursement}
          keyboardType="decimal-pad"
          editable={!isClosed}
        />

        <Input
          label="Aylık Maaş"
          placeholder="0"
          value={monthlySalary}
          onChangeText={setMonthlySalary}
          keyboardType="decimal-pad"
          editable={!isClosed}
        />

        <Input
          label="Kar Payı"
          placeholder="0"
          value={profitShare}
          onChangeText={setProfitShare}
          keyboardType="decimal-pad"
          editable={!isClosed}
        />

        <Input
          label="Fiilen Çekilen"
          placeholder="0"
          value={actualWithdrawn}
          onChangeText={setActualWithdrawn}
          keyboardType="decimal-pad"
          editable={!isClosed}
        />

        <Input
          label="Not"
          placeholder="Ek açıklama..."
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          editable={!isClosed}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {/* Summary Card */}
        <Card style={styles.summaryCard} variant="outlined">
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Hesaplama Özeti</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Önceki Bakiye:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(parseFloat(previousBalance) || 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Fiilen Çekilen (+):</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              +{formatCurrency(parseFloat(actualWithdrawn) || 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Toplam Hakediş (-):</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              -{formatCurrency(
                (parseFloat(personalExpenseReimbursement) || 0) +
                  (parseFloat(monthlySalary) || 0) +
                  (parseFloat(profitShare) || 0)
              )}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: '600' }]}>
              Sonraki Bakiye:
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  fontWeight: '700',
                  fontSize: 18,
                  color: nextBalance >= 0 ? colors.warning : colors.success,
                },
              ]}
            >
              {formatCurrency(nextBalance)}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        {!isClosed ? (
          <>
            <Button
              title={isEditing ? 'Güncelle' : 'Kaydet'}
              onPress={handleSubmit}
              loading={loading}
              size="large"
              style={{ marginTop: 16 }}
            />
            {isEditing && isAdmin && (
              <Button
                title="Dönemi Kapat"
                onPress={handleClose}
                variant="success"
                size="large"
                style={{ marginTop: 12, marginBottom: 32 }}
              />
            )}
          </>
        ) : (
          isAdmin && (
            <Button
              title="Dönemi Yeniden Aç"
              onPress={handleReopen}
              variant="warning"
              loading={loading}
              size="large"
              style={{ marginTop: 16, marginBottom: 32 }}
            />
          )
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
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  monthSelector: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
  },
  summaryCard: {
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});

export default PartnerStatementFormScreen;
