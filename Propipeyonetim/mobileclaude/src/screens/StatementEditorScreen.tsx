import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, Card, Badge, EmptyState, LoadingScreen, Input, Button } from "../components";
import {
  getStatementById,
  getStatementLines,
  addStatementLine,
  deleteStatementLine,
  closeStatement
} from "../services";
import { ProjectStatement, StatementLine, StatementLineFormData, LineDirection } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { SIZES, SHADOWS } from "../theme";

type StatementEditorRouteProp = RouteProp<
  { StatementEditor: { projectId: string; statementId: string } },
  "StatementEditor"
>;

export const StatementEditorScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserProfile } = useAuth();
  const route = useRoute<StatementEditorRouteProp>();
  const navigation = useNavigation<any>();

  const { projectId, statementId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statement, setStatement] = useState<ProjectStatement | null>(null);
  const [lines, setLines] = useState<StatementLine[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<StatementLineFormData>({
    direction: "INCOME",
    category: "PROGRESS_PAYMENT",
    amount: 0,
    isPaid: true,
    description: ""
  });

  const loadData = async () => {
    try {
      const [statementData, linesData] = await Promise.all([
        getStatementById(projectId, statementId),
        getStatementLines(projectId, statementId)
      ]);
      setStatement(statementData);
      setLines(linesData);
    } catch (error) {
      console.error("Veri yüklenemedi:", error);
      Alert.alert("Hata", "Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, statementId]);

  useEffect(() => {
    if (statement) {
      navigation.setOptions({ title: statement.title });
    }
  }, [statement]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [projectId, statementId]);

  const resetForm = () => {
    setFormData({
      direction: "INCOME",
      category: "PROGRESS_PAYMENT",
      amount: 0,
      isPaid: true,
      description: ""
    });
  };

  const handleAddLine = async () => {
    if (!formData.description.trim()) {
      Alert.alert("Hata", "Açıklama zorunludur");
      return;
    }
    if (formData.amount <= 0) {
      Alert.alert("Hata", "Tutar 0'dan büyük olmalıdır");
      return;
    }

    setSaving(true);
    try {
      await addStatementLine(projectId, statementId, formData);
      setModalVisible(false);
      resetForm();
      loadData();
      Alert.alert("Başarılı", "Satır eklendi");
    } catch (error) {
      console.error("Satır eklenemedi:", error);
      Alert.alert("Hata", "Satır eklenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLine = (line: StatementLine) => {
    Alert.alert(
      "Satırı Sil",
      `"${line.description}" satırını silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStatementLine(projectId, statementId, line.id);
              loadData();
              Alert.alert("Başarılı", "Satır silindi");
            } catch (error) {
              Alert.alert("Hata", "Satır silinirken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const handleCloseStatement = () => {
    if (!currentUserProfile) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı");
      return;
    }

    Alert.alert(
      "Hakediş Kapat",
      "Bu hakediş dosyasını kapatmak istediğinize emin misiniz? Bu işlem tersane bakiyesini güncelleyecektir.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Kapat",
          style: "default",
          onPress: async () => {
            try {
              await closeStatement(projectId, statementId, currentUserProfile);
              loadData();
              Alert.alert("Başarılı", "Hakediş kapatıldı");
            } catch (error) {
              Alert.alert("Hata", "Hakediş kapatılırken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      PROGRESS_PAYMENT: "Hakediş Ödemesi",
      SALARY: "Maaş",
      SUPPLIER: "Tedarikçi",
      OTHER: "Diğer"
    };
    return labels[category] || category;
  };

  const renderLineItem = ({ item }: { item: StatementLine }) => {
    const isIncome = item.direction === "INCOME";
    return (
      <Card style={styles.lineCard}>
        <View style={styles.lineHeader}>
          <View
            style={[
              styles.directionIcon,
              { backgroundColor: isIncome ? `${theme.colors.success}20` : `${theme.colors.error}20` }
            ]}
          >
            <Ionicons
              name={isIncome ? "arrow-down" : "arrow-up"}
              size={16}
              color={isIncome ? theme.colors.success : theme.colors.error}
            />
          </View>
          <View style={styles.lineInfo}>
            <Text style={[styles.lineDesc, { color: theme.colors.textPrimary }]}>
              {item.description}
            </Text>
            <View style={styles.lineMeta}>
              <Badge
                label={getCategoryLabel(item.category)}
                size="small"
                variant={isIncome ? "success" : "error"}
              />
              <Badge
                label={item.isPaid ? "Ödendi" : "Bekliyor"}
                size="small"
                variant={item.isPaid ? "success" : "warning"}
              />
            </View>
          </View>
          <View style={styles.lineRight}>
            <Text
              style={[
                styles.lineAmount,
                { color: isIncome ? theme.colors.success : theme.colors.error }
              ]}
            >
              {isIncome ? "+" : "-"}{formatCurrency(item.amount)}
            </Text>
            {statement?.status === "DRAFT" && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteLine(item)}
              >
                <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return <LoadingScreen message="Hakediş yükleniyor..." />;
  }

  if (!statement) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Hakediş bulunamadı"
          description="Bu hakediş dosyası mevcut değil veya silinmiş olabilir"
        />
      </Screen>
    );
  }

  const isClosed = statement.status === "CLOSED";

  return (
    <Screen scrollable={false} padding={false} refreshing={refreshing} onRefresh={onRefresh}>
      {/* Summary Header */}
      <View style={[styles.summaryHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Toplam Gelir
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
              {formatCurrency(statement.totals?.totalIncome || 0)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Toplam Gider
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
              {formatCurrency((statement.totals?.totalExpensePaid || 0) + (statement.totals?.totalExpenseUnpaid || 0))}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Net Nakit
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    (statement.totals?.netCashReal || 0) >= 0
                      ? theme.colors.success
                      : theme.colors.error
                }
              ]}
            >
              {formatCurrency(statement.totals?.netCashReal || 0)}
            </Text>
          </View>
        </View>

        <View style={[styles.balanceRow, { borderTopColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.balanceLabel, { color: theme.colors.textTertiary }]}>
              Önceki Bakiye
            </Text>
            <Text style={[styles.balanceVal, { color: theme.colors.textSecondary }]}>
              {formatCurrency(statement.previousBalance || 0)}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.textTertiary} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.balanceLabel, { color: theme.colors.textTertiary }]}>
              Final Bakiye
            </Text>
            <Text
              style={[
                styles.balanceVal,
                {
                  color:
                    (statement.finalBalance || 0) >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                  fontWeight: "700"
                }
              ]}
            >
              {formatCurrency(statement.finalBalance || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Badge
            label={isClosed ? "Kapalı" : "Taslak"}
            variant={isClosed ? "success" : "warning"}
          />
          <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
            {formatDate(statement.date)}
          </Text>
        </View>
      </View>

      {/* Close Button (if draft) */}
      {!isClosed && (
        <View style={styles.actionRow}>
          <Button
            title="Hakediş Kapat"
            onPress={handleCloseStatement}
            variant="primary"
            icon="checkmark-circle-outline"
            size="small"
          />
        </View>
      )}

      {/* Lines Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Hakediş Satırları
        </Text>
        <Badge label={`${lines.length} kayıt`} variant="info" size="small" />
      </View>

      {/* Lines List */}
      <FlatList
        data={lines}
        keyExtractor={(item) => item.id}
        renderItem={renderLineItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="list-outline"
            title="Satır yok"
            description="Bu hakediş dosyasına henüz satır eklenmemiş"
            actionLabel={isClosed ? undefined : "Satır Ekle"}
            onAction={isClosed ? undefined : () => setModalVisible(true)}
          />
        }
      />

      {/* FAB (if draft) */}
      {!isClosed && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add Line Modal */}
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
              Satır Ekle
            </Text>
            <TouchableOpacity onPress={handleAddLine} disabled={saving}>
              <Text
                style={{
                  color: saving ? theme.colors.textTertiary : theme.colors.primary,
                  fontSize: SIZES.fontMd,
                  fontWeight: "600"
                }}
              >
                {saving ? "..." : "Ekle"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Yön
              </Text>
              <View style={styles.directionSelector}>
                {(["INCOME", "EXPENSE"] as LineDirection[]).map((dir) => (
                  <TouchableOpacity
                    key={dir}
                    style={[
                      styles.directionOption,
                      {
                        backgroundColor:
                          formData.direction === dir
                            ? dir === "INCOME"
                              ? theme.colors.success
                              : theme.colors.error
                            : theme.colors.surfaceVariant
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, direction: dir }))}
                  >
                    <Ionicons
                      name={dir === "INCOME" ? "arrow-down" : "arrow-up"}
                      size={18}
                      color={formData.direction === dir ? "#fff" : theme.colors.textSecondary}
                    />
                    <Text
                      style={{
                        color: formData.direction === dir ? "#fff" : theme.colors.textSecondary,
                        marginLeft: 8
                      }}
                    >
                      {dir === "INCOME" ? "Gelir" : "Gider"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Açıklama"
              placeholder="Satır açıklaması"
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
                Ödeme Durumu
              </Text>
              <View style={styles.directionSelector}>
                <TouchableOpacity
                  style={[
                    styles.directionOption,
                    {
                      backgroundColor: formData.isPaid
                        ? theme.colors.success
                        : theme.colors.surfaceVariant,
                      flex: 1
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, isPaid: true }))}
                >
                  <Text
                    style={{
                      color: formData.isPaid ? "#fff" : theme.colors.textSecondary
                    }}
                  >
                    Ödendi
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.directionOption,
                    {
                      backgroundColor: !formData.isPaid
                        ? theme.colors.warning
                        : theme.colors.surfaceVariant,
                      flex: 1
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, isPaid: false }))}
                >
                  <Text
                    style={{
                      color: !formData.isPaid ? "#fff" : theme.colors.textSecondary
                    }}
                  >
                    Bekliyor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  summaryHeader: {
    padding: SIZES.md,
    ...SHADOWS.small
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  summaryItem: {
    alignItems: "center"
  },
  summaryLabel: {
    fontSize: SIZES.fontSm
  },
  summaryValue: {
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    marginTop: 4
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1
  },
  balanceLabel: {
    fontSize: SIZES.fontXs
  },
  balanceVal: {
    fontSize: SIZES.fontMd,
    marginTop: 2
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.md
  },
  dateText: {
    fontSize: SIZES.fontSm
  },
  actionRow: {
    padding: SIZES.md
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.sm
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: "600"
  },
  listContent: {
    paddingHorizontal: SIZES.md,
    paddingBottom: 100
  },
  lineCard: {
    marginBottom: SIZES.sm
  },
  lineHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  directionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.sm
  },
  lineInfo: {
    flex: 1
  },
  lineDesc: {
    fontSize: SIZES.fontMd,
    fontWeight: "500"
  },
  lineMeta: {
    flexDirection: "row",
    gap: SIZES.xs,
    marginTop: 4
  },
  lineRight: {
    alignItems: "flex-end"
  },
  lineAmount: {
    fontSize: SIZES.fontMd,
    fontWeight: "700"
  },
  deleteBtn: {
    marginTop: SIZES.xs,
    padding: 4
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
  directionSelector: {
    flexDirection: "row",
    gap: SIZES.sm
  },
  directionOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd
  }
});
