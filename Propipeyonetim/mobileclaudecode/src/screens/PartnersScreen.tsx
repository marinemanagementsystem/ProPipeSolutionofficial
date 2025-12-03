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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { Card, Chip, EmptyState } from '../components';
import { getPartners } from '../services/partners';
import { formatCurrency, getBalanceStatus } from '../utils/format';
import type { Partner } from '../types';
import type { PartnersStackScreenProps } from '../navigation/types';

const PartnersScreen: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const { colors } = useTheme();
  const navigation = useNavigation<PartnersStackScreenProps<'PartnersList'>['navigation']>();

  const loadPartners = useCallback(async () => {
    try {
      const data = await getPartners();
      const filtered = showInactive ? data : data.filter(p => p.isActive);
      setPartners(filtered);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showInactive]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPartners();
  };

  const totalSharePercentage = partners
    .filter(p => p.isActive)
    .reduce((sum, p) => sum + p.sharePercentage, 0);

  const renderPartnerItem = ({ item }: { item: Partner }) => {
    const balanceStatus = getBalanceStatus(item.currentBalance);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PartnerDetail', { partnerId: item.id })}
        activeOpacity={0.7}
      >
        <Card
          style={[styles.partnerCard, !item.isActive ? { opacity: 0.6 } : undefined]}
          variant="elevated"
        >
          <View style={styles.partnerHeader}>
            <View style={[styles.avatarContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.partnerInfo}>
              <Text style={[styles.partnerName, { color: colors.text }]}>{item.name}</Text>
              <View style={styles.shareRow}>
                <Chip label={`%${item.sharePercentage}`} variant="primary" size="small" />
                <Chip
                  label={item.isActive ? 'Aktif' : 'Pasif'}
                  variant={item.isActive ? 'success' : 'default'}
                  size="small"
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.partnerFooter}>
            <View>
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
                {formatCurrency(item.currentBalance)}
              </Text>
              <Text style={[styles.balanceDesc, { color: colors.textTertiary }]}>
                {balanceStatus.text}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.salaryLabel, { color: colors.textSecondary }]}>Aylık Maaş</Text>
              <Text style={[styles.salaryValue, { color: colors.text }]}>
                {formatCurrency(item.baseSalary)}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Filter Button */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
        ]}
        onPress={() => setShowInactive(!showInactive)}
      >
        <Ionicons
          name={showInactive ? 'eye' : 'eye-off'}
          size={18}
          color={colors.textSecondary}
        />
        <Text style={[styles.filterText, { color: colors.textSecondary }]}>
          {showInactive ? 'Pasif Gizle' : 'Pasif Göster'}
        </Text>
      </TouchableOpacity>

      {/* Total Share */}
      <View
        style={[
          styles.totalShareContainer,
          {
            backgroundColor:
              totalSharePercentage === 100 ? `${colors.success}20` : `${colors.warning}20`,
            borderColor: totalSharePercentage === 100 ? colors.success : colors.warning,
          },
        ]}
      >
        <Text
          style={[
            styles.totalShareText,
            { color: totalSharePercentage === 100 ? colors.success : colors.warning },
          ]}
        >
          Toplam: %{totalSharePercentage}
        </Text>
      </View>
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
        data={partners}
        renderItem={renderPartnerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Ortak bulunamadı"
            description="Henüz kayıtlı ortak yok."
            actionLabel="Ortak Ekle"
            onAction={() => navigation.navigate('PartnerForm', {})}
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
        onPress={() => navigation.navigate('PartnerForm', {})}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalShareContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  totalShareText: {
    fontSize: 13,
    fontWeight: '600',
  },
  partnerCard: {
    marginBottom: 12,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 6,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  partnerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  salaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  salaryValue: {
    fontSize: 14,
    fontWeight: '500',
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

export default PartnersScreen;
