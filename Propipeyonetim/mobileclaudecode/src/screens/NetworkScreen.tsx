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
import { getNetworkContacts } from '../services/network';
import { getCategoryLabel, getQuoteStatusLabel, getResultLabel } from '../services/dashboard';
import type { NetworkContact } from '../types';
import type { NetworkStackScreenProps } from '../navigation/types';

const NetworkScreen: React.FC = () => {
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useTheme();
  const navigation = useNavigation<NetworkStackScreenProps<'NetworkList'>['navigation']>();

  const loadContacts = useCallback(async () => {
    try {
      const data = await getNetworkContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadContacts();
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'KAZANILDI':
        return 'success';
      case 'IS_ALINDI': // legacy
        return 'success';
      case 'RED':
      case 'DONUS_YOK':
        return 'error';
      case 'BEKLEMEDE':
      case 'DEVAM_EDIYOR': // legacy
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderContactItem = ({ item }: { item: NetworkContact }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('NetworkDetail', { contactId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.contactCard} variant="elevated">
        <View style={styles.contactHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.info}20` }]}>
            <Ionicons name="business-outline" size={24} color={colors.info} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
              {item.companyName}
            </Text>
            <Text style={[styles.contactPerson, { color: colors.textSecondary }]}>
              {item.contactPerson}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.contactFooter}>
          <Chip
            label={getCategoryLabel(item.category)}
            variant="primary"
            size="small"
          />
          <Chip
            label={getQuoteStatusLabel(item.quoteStatus)}
            variant="info"
            size="small"
          />
          {item.result && (
            <Chip
              label={getResultLabel(item.result)}
              variant={getResultColor(item.result) as any}
              size="small"
            />
          )}
        </View>

        {item.phone && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{item.phone}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
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
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Kişi bulunamadı"
            description="Henüz kayıtlı network kişisi yok."
            actionLabel="Kişi Ekle"
            onAction={() => navigation.navigate('NetworkForm', {})}
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
        onPress={() => navigation.navigate('NetworkForm', {})}
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
  contactCard: {
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactPerson: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  contactFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  phoneText: {
    fontSize: 13,
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

export default NetworkScreen;
