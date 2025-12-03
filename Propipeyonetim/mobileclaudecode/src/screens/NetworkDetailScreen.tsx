import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Chip, Button } from '../components';
import { getNetworkContactById, deleteNetworkContact } from '../services/network';
import { getCategoryLabel, getQuoteStatusLabel, getContactStatusLabel, getResultLabel } from '../services/dashboard';
import { formatDate, formatPhone } from '../utils/format';
import type { NetworkContact } from '../types';
import type { NetworkStackScreenProps } from '../navigation/types';

type Props = NetworkStackScreenProps<'NetworkDetail'>;

const NetworkDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { contactId } = route.params;
  const [contact, setContact] = useState<NetworkContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { colors } = useTheme();
  const { currentUserAuth, isAdmin } = useAuth();

  useEffect(() => {
    loadContact();
  }, [contactId]);

  const loadContact = async () => {
    try {
      const data = await getNetworkContactById(contactId);
      setContact(data);
    } catch (error) {
      console.error('Error loading contact:', error);
      Alert.alert('Hata', 'Kişi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (contact?.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleEmail = () => {
    if (contact?.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Kişiyi Sil',
      'Bu kişiyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteNetworkContact(contactId, currentUserAuth ? {
                uid: currentUserAuth.uid,
                email: currentUserAuth.email,
                displayName: currentUserAuth.displayName,
              } : undefined);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Hata', 'Kişi silinirken bir hata oluştu.');
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

  if (!contact) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Kişi bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header Card */}
        <Card style={styles.headerCard} variant="elevated">
          <View style={[styles.iconContainer, { backgroundColor: `${colors.info}20` }]}>
            <Ionicons name="business" size={40} color={colors.info} />
          </View>
          <Text style={[styles.companyName, { color: colors.text }]}>{contact.companyName}</Text>
          <Text style={[styles.contactPerson, { color: colors.textSecondary }]}>
            {contact.contactPerson}
          </Text>

          <View style={styles.chipRow}>
            <Chip label={getCategoryLabel(contact.category)} variant="primary" />
            <Chip label={getContactStatusLabel(contact.contactStatus)} variant="info" />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {contact.phone && (
              <Button
                title="Ara"
                onPress={handleCall}
                variant="primary"
                size="small"
                icon={<Ionicons name="call" size={16} color="#0f172a" />}
              />
            )}
            {contact.email && (
              <Button
                title="E-posta"
                onPress={handleEmail}
                variant="outline"
                size="small"
                icon={<Ionicons name="mail-outline" size={16} color={colors.primary} />}
              />
            )}
          </View>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard} variant="outlined">
          {contact.phone && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Telefon</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{formatPhone(contact.phone)}</Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </>
          )}

          {contact.email && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>E-posta</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{contact.email}</Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Teklif Durumu</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{getQuoteStatusLabel(contact.quoteStatus)}</Text>
            </View>
          </View>

          {contact.result && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sonuç</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{getResultLabel(contact.result)}</Text>
                </View>
              </View>
            </>
          )}

          {contact.serviceArea && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Hizmet Alanı</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{contact.serviceArea}</Text>
                </View>
              </View>
            </>
          )}

          {contact.shipType && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.detailRow}>
                <Ionicons name="boat-outline" size={20} color={colors.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Gemi Tipi</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{contact.shipType}</Text>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Notes */}
        {contact.notes && (
          <Card style={styles.notesCard} variant="outlined">
            <Text style={[styles.notesTitle, { color: colors.text }]}>Notlar</Text>
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>{contact.notes}</Text>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Düzenle"
            onPress={() => navigation.navigate('NetworkForm', { contactId: contact.id })}
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
  headerCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  contactPerson: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
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
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
  },
  divider: {
    height: 1,
  },
  notesCard: {
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
});

export default NetworkDetailScreen;
