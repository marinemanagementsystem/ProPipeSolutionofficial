import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components';
import { createPartner, updatePartner, getPartnerById } from '../services/partners';
import type { PartnersStackScreenProps } from '../navigation/types';

type Props = PartnersStackScreenProps<'PartnerForm'>;

const PartnerFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const partnerId = route.params?.partnerId;
  const isEditing = !!partnerId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const [name, setName] = useState('');
  const [sharePercentage, setSharePercentage] = useState('');
  const [baseSalary, setBaseSalary] = useState('');

  const { colors } = useTheme();
  const { currentUserAuth } = useAuth();

  useEffect(() => {
    if (isEditing && partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      const partner = await getPartnerById(partnerId!);
      if (partner) {
        setName(partner.name);
        setSharePercentage(partner.sharePercentage.toString());
        setBaseSalary(partner.baseSalary.toString());
      }
    } catch (error) {
      console.error('Error loading partner:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Ortak adı girin.');
      return;
    }
    if (!sharePercentage || parseFloat(sharePercentage) <= 0 || parseFloat(sharePercentage) > 100) {
      Alert.alert('Hata', 'Geçerli bir hisse oranı girin (1-100).');
      return;
    }

    try {
      setLoading(true);

      const formData = {
        name: name.trim(),
        sharePercentage: parseFloat(sharePercentage),
        baseSalary: parseFloat(baseSalary) || 0,
      };

      const user = currentUserAuth ? {
        uid: currentUserAuth.uid,
        email: currentUserAuth.email || '',
        displayName: currentUserAuth.displayName || undefined,
      } : undefined;

      if (isEditing && partnerId) {
        await updatePartner(partnerId, formData, user);
      } else {
        await createPartner(formData, user);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving partner:', error);
      Alert.alert('Hata', 'Ortak kaydedilirken bir hata oluştu.');
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Input
          label="Ortak Adı *"
          placeholder="Örn: Ahmet Yılmaz"
          value={name}
          onChangeText={setName}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Hisse Oranı (%) *"
          placeholder="0-100"
          value={sharePercentage}
          onChangeText={setSharePercentage}
          keyboardType="decimal-pad"
          leftIcon={<Ionicons name="pie-chart-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Aylık Maaş (TL)"
          placeholder="0"
          value={baseSalary}
          onChangeText={setBaseSalary}
          keyboardType="decimal-pad"
          leftIcon={<Ionicons name="cash-outline" size={20} color={colors.textTertiary} />}
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
});

export default PartnerFormScreen;
