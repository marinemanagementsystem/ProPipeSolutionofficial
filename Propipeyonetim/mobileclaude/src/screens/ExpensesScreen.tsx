import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, Card, Badge, Button, EmptyState, LoadingScreen, Input } from "../components";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from "../services";
import {
  Expense,
  ExpenseFormData,
  ExpenseType,
  ExpenseStatus,
  Currency,
  getExpenseTypeLabel,
  getExpenseStatusLabel,
  getCurrencySymbol
} from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { SIZES, SHADOWS } from "../theme";

export const ExpensesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserProfile, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    description: "",
    date: new Date(),
    type: "COMPANY_OFFICIAL",
    status: "PAID",
    ownerId: "",
    currency: "TRY"
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadExpenses = async () => {
    try {
      const data = await getExpenses({ showDeleted });
      setExpenses(data);
    } catch (error) {
      console.error("Giderler yüklenemedi:", error);
      Alert.alert("Hata", "Giderler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [showDeleted]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadExpenses();
  }, [showDeleted]);

  const resetForm = () => {
    setFormData({
      amount: 0,
      description: "",
      date: new Date(),
      type: "COMPANY_OFFICIAL",
      status: "PAID",
      ownerId: currentUserProfile?.id || "",
      currency: "TRY"
    });
    setEditingExpense(null);
  };

  const openAddModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, ownerId: currentUserProfile?.id || "" }));
    setModalVisible(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      description: expense.description,
      date: expense.date.toDate(),
      type: expense.type,
      status: expense.status,
      ownerId: expense.ownerId,
      currency: expense.currency,
      paymentMethod: expense.paymentMethod,
      category: expense.category
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      Alert.alert("Hata", "Açıklama zorunludur");
      return;
    }
    if (formData.amount <= 0) {
      Alert.alert("Hata", "Tutar 0'dan büyük olmalıdır");
      return;
    }
    if (!currentUserProfile) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı");
      return;
    }

    setSaving(true);
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, formData, currentUserProfile);
      } else {
        await createExpense(formData, currentUserProfile);
      }
      setModalVisible(false);
      resetForm();
      loadExpenses();
      Alert.alert("Başarılı", editingExpense ? "Gider güncellendi" : "Gider eklendi");
    } catch (error) {
      console.error("Gider kaydedilemedi:", error);
      Alert.alert("Hata", "Gider kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      "Gideri Sil",
      `"${expense.description}" giderini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (!currentUserProfile) return;
            try {
              await deleteExpense(expense.id, currentUserProfile);
              loadExpenses();
              Alert.alert("Başarılı", "Gider silindi");
            } catch (error) {
              Alert.alert("Hata", "Gider silinirken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const getStatusBadgeVariant = (status: ExpenseStatus) => {
    return status === "PAID" ? "success" : "warning";
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Card
      style={[styles.expenseCard, item.isDeleted && styles.deletedCard]}
      onPress={() => !item.isDeleted && openEditModal(item)}
    >
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text
            style={[styles.expenseDesc, { color: theme.colors.textPrimary }]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
          <Text style={[styles.expenseDate, { color: theme.colors.textTertiary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <Text
          style={[
            styles.expenseAmount,
            { color: item.status === "PAID" ? theme.colors.error : theme.colors.warning }
          ]}
        >
          {formatCurrency(item.amount, item.currency)}
        </Text>
      </View>

      <View style={styles.expenseFooter}>
        <View style={styles.badges}>
          <Badge
            label={getExpenseTypeLabel(item.type)}
            variant="default"
            size="small"
          />
          <Badge
            label={getExpenseStatusLabel(item.status)}
            variant={getStatusBadgeVariant(item.status)}
            size="small"
          />
        </View>

        {!item.isDeleted && (
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const totalAmount = expenses
    .filter(e => !e.isDeleted)
    .reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return <LoadingScreen message="Giderler yükleniyor..." />;
  }

  return (
    <Screen scrollable={false} padding={false}>
      {/* Header Stats */}
      <View style={[styles.headerStats, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Toplam Gider
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Kayıt Sayısı
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {expenses.filter(e => !e.isDeleted).length}
          </Text>
        </View>
      </View>

      {/* Filters */}
      {isAdmin && (
        <View style={styles.filters}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: !showDeleted ? theme.colors.primary : theme.colors.surfaceVariant
              }
            ]}
            onPress={() => setShowDeleted(false)}
          >
            <Text
              style={{
                color: !showDeleted ? "#fff" : theme.colors.textSecondary,
                fontSize: SIZES.fontSm
              }}
            >
              Aktif
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: showDeleted ? theme.colors.primary : theme.colors.surfaceVariant
              }
            ]}
            onPress={() => setShowDeleted(true)}
          >
            <Text
              style={{
                color: showDeleted ? "#fff" : theme.colors.textSecondary,
                fontSize: SIZES.fontSm
              }}
            >
              Silinmiş
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expense List */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Gider bulunamadı"
            description="Henüz kayıtlı gider yok"
            actionLabel="Gider Ekle"
            onAction={openAddModal}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: theme.colors.error, fontSize: SIZES.fontMd }}>
                İptal
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              {editingExpense ? "Gider Düzenle" : "Yeni Gider"}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text
                style={{
                  color: saving ? theme.colors.textTertiary : theme.colors.primary,
                  fontSize: SIZES.fontMd,
                  fontWeight: "600"
                }}
              >
                {saving ? "..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Açıklama"
              placeholder="Gider açıklaması"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            />

            <Input
              label="Tutar"
              placeholder="0.00"
              value={formData.amount > 0 ? formData.amount.toString() : ""}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, amount: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
            />

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Tarih
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: theme.colors.textPrimary }}>
                  {formatDate(formData.date)}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.date}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setFormData(prev => ({ ...prev, date }));
                }}
              />
            )}

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Tür
              </Text>
              <View style={styles.typeSelector}>
                {(["COMPANY_OFFICIAL", "PERSONAL", "ADVANCE"] as ExpenseType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          formData.type === type
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                  >
                    <Text
                      style={{
                        color: formData.type === type ? "#fff" : theme.colors.textSecondary,
                        fontSize: SIZES.fontSm
                      }}
                    >
                      {getExpenseTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Durum
              </Text>
              <View style={styles.typeSelector}>
                {(["PAID", "UNPAID"] as ExpenseStatus[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          formData.status === status
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, status }))}
                  >
                    <Text
                      style={{
                        color: formData.status === status ? "#fff" : theme.colors.textSecondary,
                        fontSize: SIZES.fontSm
                      }}
                    >
                      {getExpenseStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Para Birimi
              </Text>
              <View style={styles.typeSelector}>
                {(["TRY", "EUR", "USD"] as Currency[]).map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          formData.currency === currency
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, currency }))}
                  >
                    <Text
                      style={{
                        color:
                          formData.currency === currency ? "#fff" : theme.colors.textSecondary,
                        fontSize: SIZES.fontSm
                      }}
                    >
                      {getCurrencySymbol(currency)} {currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerStats: {
    flexDirection: "row",
    padding: SIZES.md,
    ...SHADOWS.small
  },
  statItem: {
    flex: 1,
    alignItems: "center"
  },
  statLabel: {
    fontSize: SIZES.fontSm
  },
  statValue: {
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    marginTop: 4
  },
  filters: {
    flexDirection: "row",
    padding: SIZES.md,
    gap: SIZES.sm
  },
  filterChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull
  },
  listContent: {
    padding: SIZES.md,
    paddingBottom: 100
  },
  expenseCard: {
    marginBottom: SIZES.sm
  },
  deletedCard: {
    opacity: 0.6
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.sm
  },
  expenseInfo: {
    flex: 1
  },
  expenseDesc: {
    fontSize: SIZES.fontMd,
    fontWeight: "500"
  },
  expenseDate: {
    fontSize: SIZES.fontSm,
    marginTop: 2
  },
  expenseAmount: {
    fontSize: SIZES.fontLg,
    fontWeight: "700"
  },
  expenseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  badges: {
    flexDirection: "row",
    gap: SIZES.xs
  },
  fab: {
    position: "absolute",
    right: SIZES.md,
    bottom: SIZES.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.large
  },
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.md,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: "600"
  },
  modalContent: {
    flex: 1,
    padding: SIZES.md
  },
  formRow: {
    marginBottom: SIZES.md
  },
  formLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: "500",
    marginBottom: SIZES.xs
  },
  dateButton: {
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd
  },
  typeSelector: {
    flexDirection: "row",
    gap: SIZES.xs,
    flexWrap: "wrap"
  },
  typeOption: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd
  },
  bottomPadding: {
    height: 100
  }
});
