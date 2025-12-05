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
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Chip, Button, EmptyState } from '../components';
import { getPartnerById, getPartnerStatements } from '../services/partners';
import { formatCurrency, getBalanceStatus, getMonthName } from '../utils/format';
import type { Partner, PartnerStatement } from '../types';
import type { PartnersStackScreenProps } from '../navigation/types';

type Props = PartnersStackScreenProps<'PartnerDetail'>;

const PartnerDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { partnerId } = route.params;
  const [partner, setPartner] = useState<Partner | null>(null);
  const [statements, setStatements] = useState<PartnerStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();
  const { isAdmin } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const [partnerData, statementsData] = await Promise.all([
        getPartnerById(partnerId),
        getPartnerStatements(partnerId),
      ]);
      setPartner(partnerData);
      setStatements(statementsData);
    } catch (error) {
      console.error('Error loading partner:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [partnerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

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

  if (!partner) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Ortak bulunamadı</Text>
      </View>
    );
  }

  const balanceStatus = getBalanceStatus(partner.currentBalance);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.content}>
        {/* Partner Info Card */}
        <Card style={styles.infoCard} variant="elevated">
          <View style={[styles.avatarContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {partner.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.partnerName, { color: colors.text }]}>{partner.name}</Text>

          <View style={styles.chipRow}>
            <Chip label={`%${partner.sharePercentage}`} variant="primary" />
            <Chip
              label={partner.isActive ? 'Aktif' : 'Pasif'}
              variant={partner.isActive ? 'success' : 'default'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Güncel Bakiye</Text>
            <Text
              style={[
                styles.balanceValue,
                {
                  color:
                    balanceStatus.type === 'positive'
                      ? colors.warning
                      : balanceStatus.type === 'negative'
                      ? colors.success
                      : colors.text,
                },
              ]}
            >
              {formatCurrency(partner.currentBalance)}
            </Text>
            <Text style={[styles.balanceDesc, { color: colors.textTertiary }]}>
              {balanceStatus.text}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.salaryRow}>
            <Text style={[styles.salaryLabel, { color: colors.textSecondary }]}>Aylık Maaş:</Text>
            <Text style={[styles.salaryValue, { color: colors.text }]}>
              {formatCurrency(partner.baseSalary)}
            </Text>
          </View>

          {isAdmin && (
            <Button
              title="Düzenle"
              onPress={() => navigation.navigate('PartnerForm', { partnerId: partner.id })}
              variant="outline"
              size="small"
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* Statements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dönemler</Text>
            {isAdmin && (
              <Button
                title="Yeni Dönem"
                onPress={() => navigation.navigate('PartnerStatementForm', { partnerId: partner.id })}
                variant="primary"
                size="small"
                icon={<Ionicons name="add" size={16} color="#0f172a" />}
              />
            )}
          </View>

          {statements.length === 0 ? (
            <Card variant="outlined">
              <EmptyState
                icon="calendar-outline"
                title="Dönem bulunamadı"
                description="Bu ortak için henüz dönem kaydı yok."
              />
            </Card>
          ) : (
            statements.map((statement) => (
              <TouchableOpacity
                key={statement.id}
                onPress={() =>
                  navigation.navigate('PartnerStatementForm', {
                    partnerId: partner.id,
                    statementId: statement.id,
                  })
                }
                activeOpacity={0.7}
              >
                <Card style={styles.statementCard} variant="outlined">
                  <View style={styles.statementHeader}>
                    <Text style={[styles.statementPeriod, { color: colors.text }]}>
                      {getMonthName(statement.month - 1)} {statement.year}
                    </Text>
                    <Chip
                      label={statement.status === 'CLOSED' ? 'Kapalı' : 'Taslak'}
                      variant={statement.status === 'CLOSED' ? 'success' : 'warning'}
                      size="small"
                    />
                  </View>

                  <View style={styles.statementDetails}>
                    <View style={styles.statementRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Önceki Bakiye:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {formatCurrency(statement.previousBalance)}
                      </Text>
                    </View>
                    <View style={styles.statementRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Çekilen:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.success }]}>
                        +{formatCurrency(statement.actualWithdrawn)}
                      </Text>
                    </View>
                    <View style={styles.statementRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Hakediş (Maaş + Kar):
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.error }]}>
                        -{formatCurrency(statement.monthlySalary + statement.profitShare + statement.personalExpenseReimbursement)}
                      </Text>
                    </View>
                    <View style={[styles.statementRow, styles.totalRow]}>
                      <Text style={[styles.detailLabel, { color: colors.text, fontWeight: '600' }]}>
                        Sonraki Bakiye:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          {
                            fontWeight: '700',
                            color: statement.nextMonthBalance >= 0 ? colors.warning : colors.success,
                          },
                        ]}
                      >
                        {formatCurrency(statement.nextMonthBalance)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
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
  infoCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  partnerName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  balanceDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salaryLabel: {
    fontSize: 14,
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
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
  statementCard: {
    marginBottom: 12,
  },
  statementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statementPeriod: {
    fontSize: 16,
    fontWeight: '600',
  },
  statementDetails: {
    gap: 6,
  },
  statementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
  },
});

export default PartnerDetailScreen;
