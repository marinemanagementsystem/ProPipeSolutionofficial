import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components';
import { createNetworkContact, updateNetworkContact, getNetworkContactById } from '../services/network';
import type { NetworkContactFormData, ContactCategory, ContactStatus, QuoteStatus, ContactResult } from '../types';
import type { NetworkStackScreenProps } from '../navigation/types';

type Props = NetworkStackScreenProps<'NetworkForm'>;

const NetworkFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const contactId = route.params?.contactId;
  const isEditing = !!contactId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ContactCategory>('YENI_INSA');
  const [serviceArea, setServiceArea] = useState('');
  const [shipType, setShipType] = useState('');
  const [contactStatus, setContactStatus] = useState<ContactStatus>('ILK_TEMAS');
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>('HAYIR');
  const [result, setResult] = useState<ContactResult | undefined>();
  const [notes, setNotes] = useState('');

  const { colors } = useTheme();
  const { currentUserAuth } = useAuth();

  useEffect(() => {
    if (isEditing && contactId) {
      loadContact();
    }
  }, [contactId]);

  const loadContact = async () => {
    try {
      const contact = await getNetworkContactById(contactId!);
      if (contact) {
        setCompanyName(contact.companyName);
        setContactPerson(contact.contactPerson);
        setPhone(contact.phone || '');
        setEmail(contact.email || '');
        setCategory(contact.category);
        setServiceArea(contact.serviceArea || '');
        setShipType(contact.shipType || '');
        setContactStatus(contact.contactStatus);
        setQuoteStatus(contact.quoteStatus);
        setResult(contact.result);
        setNotes(contact.notes || '');
      }
    } catch (error) {
      console.error('Error loading contact:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      Alert.alert('Hata', 'Firma adı girin.');
      return;
    }
    if (!contactPerson.trim()) {
      Alert.alert('Hata', 'İletişim kişisi girin.');
      return;
    }

    try {
      setLoading(true);

      const formData: NetworkContactFormData = {
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        category,
        serviceArea: serviceArea.trim() || undefined,
        shipType: shipType.trim() || undefined,
        contactStatus,
        quoteStatus,
        result: result || undefined,
        notes: notes.trim() || undefined,
      };

      const user = currentUserAuth ? {
        uid: currentUserAuth.uid,
        email: currentUserAuth.email,
        displayName: currentUserAuth.displayName,
      } : undefined;

      if (isEditing && contactId) {
        await updateNetworkContact(contactId, formData, user);
      } else {
        await createNetworkContact(formData, user);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Hata', 'Kişi kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const categories: { value: ContactCategory; label: string }[] = [
    { value: 'YENI_INSA', label: 'Yeni İnşa' },
    { value: 'TAMIR', label: 'Tamir' },
    { value: 'YAT', label: 'Yat' },
    { value: 'ASKERI_PROJE', label: 'Askeri' },
    { value: 'TANKER', label: 'Tanker' },
    { value: 'DIGER', label: 'Diğer' },
  ];

  const quoteStatuses: { value: QuoteStatus; label: string }[] = [
    { value: 'HAYIR', label: 'Teklif Yok' },
    { value: 'TEKLIF_BEKLENIYOR', label: 'Bekleniyor' },
    { value: 'TEKLIF_VERILDI', label: 'Verildi' },
    { value: 'TEKLIF_VERILECEK', label: 'Verilecek' },
    { value: 'GORUSME_DEVAM_EDIYOR', label: 'Devam Ediyor' },
  ];

  const results: { value: ContactResult; label: string }[] = [
    { value: 'DEVAM_EDIYOR', label: 'Devam' },
    { value: 'IS_ALINDI', label: 'İş Alındı' },
    { value: 'RED', label: 'Red' },
    { value: 'IS_YOK', label: 'İş Yok' },
    { value: 'DONUS_YOK', label: 'Dönüş Yok' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Input
          label="Firma Adı *"
          placeholder="Firma adı..."
          value={companyName}
          onChangeText={setCompanyName}
          leftIcon={<Ionicons name="business-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="İletişim Kişisi *"
          placeholder="Ad Soyad"
          value={contactPerson}
          onChangeText={setContactPerson}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Telefon"
          placeholder="0xxx xxx xx xx"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="E-posta"
          placeholder="ornek@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textTertiary} />}
        />

        {/* Category */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori</Text>
        <View style={styles.optionRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: category === c.value ? colors.primary : colors.surfaceVariant,
                  borderColor: category === c.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={{ color: category === c.value ? '#0f172a' : colors.text, fontSize: 11 }}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quote Status */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Teklif Durumu</Text>
        <View style={styles.optionRow}>
          {quoteStatuses.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: quoteStatus === s.value ? colors.info : colors.surfaceVariant,
                  borderColor: quoteStatus === s.value ? colors.info : colors.border,
                },
              ]}
              onPress={() => setQuoteStatus(s.value)}
            >
              <Text style={{ color: quoteStatus === s.value ? '#fff' : colors.text, fontSize: 11 }}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Result */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Sonuç</Text>
        <View style={styles.optionRow}>
          {results.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: result === r.value ? (r.value === 'IS_ALINDI' ? colors.success : r.value === 'RED' ? colors.error : colors.warning) : colors.surfaceVariant,
                  borderColor: result === r.value ? (r.value === 'IS_ALINDI' ? colors.success : r.value === 'RED' ? colors.error : colors.warning) : colors.border,
                },
              ]}
              onPress={() => setResult(result === r.value ? undefined : r.value)}
            >
              <Text style={{ color: result === r.value ? '#fff' : colors.text, fontSize: 11 }}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Hizmet Alanı"
          placeholder="Örn: İstanbul, Tuzla"
          value={serviceArea}
          onChangeText={setServiceArea}
        />

        <Input
          label="Gemi Tipi"
          placeholder="Örn: Tanker, Konteyner"
          value={shipType}
          onChangeText={setShipType}
        />

        <Input
          label="Notlar"
          placeholder="Ek notlar..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <Button
          title={isEditing ? 'Güncelle' : 'Kaydet'}
          onPress={handleSubmit}
          loading={loading}
          size="large"
          style={{ marginTop: 24, marginBottom: 32 }}
        />
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
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
});

export default NetworkFormScreen;
