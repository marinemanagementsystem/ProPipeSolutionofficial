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
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card } from '../components';
import { createExpense, updateExpense, getExpenseById } from '../services/expenses';
import { getActivePartners } from '../services/partners';
import { getProjects } from '../services/projects';
import type { ExpenseFormData, ExpenseType, ExpenseStatus, PaymentMethod, Currency, Partner, Project } from '../types';
import type { ExpensesStackScreenProps } from '../navigation/types';

type Props = ExpensesStackScreenProps<'ExpenseForm'>;

const ExpenseFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const expenseId = route.params?.expenseId;
  const isEditing = !!expenseId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<ExpenseType>('COMPANY_OFFICIAL');
  const [status, setStatus] = useState<ExpenseStatus>('PAID');
  const [ownerId, setOwnerId] = useState('');
  const [currency, setCurrency] = useState<Currency>('TRY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('NAKIT');
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const { colors } = useTheme();
  const { currentUserAuth } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [partnersData, projectsData] = await Promise.all([
        getActivePartners(),
        getProjects(),
      ]);
      setPartners(partnersData);
      setProjects(projectsData);

      if (isEditing && expenseId) {
        const expense = await getExpenseById(expenseId);
        if (expense) {
          setAmount(expense.amount.toString());
          setDescription(expense.description);
          setDate(expense.date.toDate());
          setType(expense.type);
          setStatus(expense.status);
          setOwnerId(expense.ownerId);
          setCurrency(expense.currency);
          setPaymentMethod(expense.paymentMethod);
          setProjectId(expense.projectId || '');
          setCategory(expense.category || '');
          if (expense.receiptUrl) {
            setReceiptImage(expense.receiptUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera erişimi için izin gereklidir.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Hata', 'Açıklama girin.');
      return;
    }
    if (!ownerId) {
      Alert.alert('Hata', 'Gider sahibi seçin.');
      return;
    }

    try {
      setLoading(true);

      const formData: ExpenseFormData = {
        amount: parseFloat(amount),
        description: description.trim(),
        date,
        type,
        status,
        ownerId,
        currency,
        paymentMethod,
        projectId: projectId || undefined,
        category: category || undefined,
        receiptFile: receiptImage && !receiptImage.startsWith('http') ? receiptImage : undefined,
      };

      const user = currentUserAuth ? {
        uid: currentUserAuth.uid,
        email: currentUserAuth.email,
        displayName: currentUserAuth.displayName,
      } : undefined;

      if (isEditing && expenseId) {
        await updateExpense(expenseId, formData, user);
      } else {
        await createExpense(formData, user);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Hata', 'Gider kaydedilirken bir hata oluştu.');
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
          label="Tutar"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          leftIcon={<Ionicons name="cash-outline" size={20} color={colors.textTertiary} />}
        />

        <Input
          label="Açıklama"
          placeholder="Gider açıklaması..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {/* Type Selection */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Gider Türü</Text>
        <View style={styles.optionRow}>
          {(['COMPANY_OFFICIAL', 'PERSONAL', 'ADVANCE'] as ExpenseType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.optionButton,
                {
                  backgroundColor: type === t ? colors.primary : colors.surfaceVariant,
                  borderColor: type === t ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setType(t)}
            >
              <Text style={{ color: type === t ? '#0f172a' : colors.text, fontSize: 12 }}>
                {t === 'COMPANY_OFFICIAL' ? 'Şirket' : t === 'PERSONAL' ? 'Kişisel' : 'Avans'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Selection */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Durum</Text>
        <View style={styles.optionRow}>
          {(['PAID', 'UNPAID'] as ExpenseStatus[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.optionButton,
                {
                  backgroundColor: status === s ? (s === 'PAID' ? colors.success : colors.warning) : colors.surfaceVariant,
                  borderColor: status === s ? (s === 'PAID' ? colors.success : colors.warning) : colors.border,
                },
              ]}
              onPress={() => setStatus(s)}
            >
              <Text style={{ color: status === s ? '#fff' : colors.text, fontSize: 12 }}>
                {s === 'PAID' ? 'Ödendi' : 'Ödenmedi'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Owner Selection */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Gider Sahibi</Text>
        <View style={styles.optionRow}>
          {partners.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.optionButton,
                {
                  backgroundColor: ownerId === p.id ? colors.primary : colors.surfaceVariant,
                  borderColor: ownerId === p.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setOwnerId(p.id)}
            >
              <Text style={{ color: ownerId === p.id ? '#0f172a' : colors.text, fontSize: 12 }}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Ödeme Yöntemi</Text>
        <View style={styles.optionRow}>
          {(['NAKIT', 'HAVALE', 'KREDI_KARTI', 'CEK'] as PaymentMethod[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.optionButton,
                {
                  backgroundColor: paymentMethod === m ? colors.primary : colors.surfaceVariant,
                  borderColor: paymentMethod === m ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setPaymentMethod(m)}
            >
              <Text style={{ color: paymentMethod === m ? '#0f172a' : colors.text, fontSize: 11 }}>
                {m === 'NAKIT' ? 'Nakit' : m === 'HAVALE' ? 'Havale' : m === 'KREDI_KARTI' ? 'K.Kartı' : 'Çek'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Kategori (Opsiyonel)"
          placeholder="Kategori..."
          value={category}
          onChangeText={setCategory}
        />

        {/* Receipt Upload */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Fiş/Fatura</Text>
        <View style={styles.receiptButtons}>
          <Button title="Galeri" onPress={pickImage} variant="outline" size="small" />
          <Button title="Kamera" onPress={takePhoto} variant="outline" size="small" />
        </View>
        {receiptImage && (
          <Card style={styles.receiptPreview} variant="outlined">
            <Text style={{ color: colors.success }}>Fiş seçildi</Text>
          </Card>
        )}

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
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  receiptPreview: {
    padding: 12,
    alignItems: 'center',
  },
});

export default ExpenseFormScreen;
