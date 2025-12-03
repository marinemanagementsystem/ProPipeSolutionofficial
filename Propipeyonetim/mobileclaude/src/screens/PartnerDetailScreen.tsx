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
import { Screen, Card, Badge, EmptyState, LoadingScreen, Input } from "../components";
import {
  getPartnerById,
  getPartnerStatements,
  createPartnerStatement
} from "../services";
import { Partner, PartnerStatement, PartnerStatementFormData } from "../types";
import { formatCurrency, formatMonthYear, formatPercentage } from "../utils/format";
import { SIZES, SHADOWS } from "../theme";

type PartnerDetailRouteProp = RouteProp<{ PartnerDetail: { partnerId: string } }, "PartnerDetail">;

export const PartnerDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<PartnerDetailRouteProp>();
  const navigation = useNavigation<any>();

  const { partnerId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [statements, setStatements] = useState<PartnerStatement[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const now = new Date();
  const [formData, setFormData] = useState<PartnerStatementFormData>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    previousBalance: 0,
    personalExpenseReimbursement: 0,
    monthlySalary: 0,
    profitShare: 0,
    actualWithdrawn: 0,
    note: ""
  });

  const loadData = async () => {
    try {
      const [partnerData, statementsData] = await Promise.all([
        getPartnerById(partnerId),
        getPartnerStatements(partnerId)
      ]);
      setPartner(partnerData);
      setStatements(statementsData);

      // Update form with partner data
      if (partnerData) {
        setFormData(prev => ({
          ...prev,
          previousBalance: partnerData.currentBalance || 0,
          monthlySalary: partnerData.baseSalary || 0
        }));
      }
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
  }, [partnerId]);

  useEffect(() => {
    if (partner) {
      navigation.setOptions({ title: partner.name });
    }
  }, [partner]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [partnerId]);

  const handleCreateStatement = async () => {
    setSaving(true);
    try {
      await createPartnerStatement(partnerId, formData);
      setModalVisible(false);
      loadData();
      Alert.alert("Başarılı", "Hesap özeti oluşturuldu");
    } catch (error) {
      console.error("Hesap özeti oluşturulamadı:", error);
      Alert.alert("Hata", "Hesap özeti oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const calculateNextBalance = () => {
    const { previousBalance, personalExpenseReimbursement, monthlySalary, profitShare, actualWithdrawn } = formData;
    return previousBalance + actualWithdrawn - (personalExpenseReimbursement + monthlySalary + profitShare);
  };

  const renderStatementItem = ({ item }: { item: PartnerStatement }) => (
    <Card style={styles.statementCard}>
      <View style={styles.statementHeader}>
        <View>
          <Text style={[styles.monthText, { color: theme.colors.textPrimary }]}>
            {formatMonthYear(item.month, item.year)}
          </Text>
        </View>
        <Badge
          label={item.status === "CLOSED" ? "Kapalı" : "Taslak"}
          variant={item.status === "CLOSED" ? "success" : "warning"}
          size="small"
        />
      </View>

      <View style={[styles.detailsGrid, { borderTopColor: theme.colors.border }]}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>
            Önceki Bakiye
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
            {formatCurrency(item.previousBalance)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>
            Gider İadesi
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.success }]}>
            +{formatCurrency(item.personalExpenseReimbursement)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>
            Maaş
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.success }]}>
            +{formatCurrency(item.monthlySalary)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>
            Kar Payı
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.success }]}>
            +{formatCurrency(item.profitShare)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textTertiary }]}>
            Çekilen
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.error }]}>
            -{formatCurrency(item.actualWithdrawn)}
          </Text>
        </View>
      </View>

      <View style={[styles.resultRow, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
          Sonraki Ay Bakiyesi
        </Text>
        <Text
          style={[
            styles.resultValue,
            { color: item.nextMonthBalance >= 0 ? theme.colors.success : theme.colors.error }
          ]}
        >
          {formatCurrency(item.nextMonthBalance)}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingScreen message="Ortak yükleniyor..." />;
  }

  if (!partner) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Ortak bulunamadı"
          description="Bu ortak mevcut değil veya silinmiş olabilir"
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} padding={false} refreshing={refreshing} onRefresh={onRefresh}>
      {/* Partner Info Header */}
      <View style={[styles.partnerHeader, { backgroundColor: theme.colors.surface }]}>
        <View
          style={[
            styles.avatarLarge,
            { backgroundColor: `${theme.colors.primary}20` }
          ]}
        >
          <Text style={[styles.avatarTextLarge, { color: theme.colors.primary }]}>
            {partner.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.partnerInfoSection}>
          <Text style={[styles.partnerName, { color: theme.colors.textPrimary }]}>
            {partner.name}
          </Text>
          <View style={styles.partnerMeta}>
            <Badge label={formatPercentage(partner.sharePercentage)} variant="info" />
            {!partner.isActive && <Badge label="Pasif" variant="error" />}
          </View>
        </View>
      </View>

      {/* Partner Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: theme.colors.textTertiary }]}>
            Sabit Maaş
          </Text>
          <Text style={[styles.statBoxValue, { color: theme.colors.textPrimary }]}>
            {formatCurrency(partner.baseSalary)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statBoxLabel, { color: theme.colors.textTertiary }]}>
            Mevcut Bakiye
          </Text>
          <Text
            style={[
              styles.statBoxValue,
              { color: partner.currentBalance >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {formatCurrency(partner.currentBalance)}
          </Text>
        </View>
      </View>

      {/* Statements Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Aylık Hesap Özetleri
        </Text>
        <Badge label={`${statements.length} kayıt`} variant="info" size="small" />
      </View>

      {/* Statements List */}
      <FlatList
        data={statements}
        keyExtractor={(item) => item.id}
        renderItem={renderStatementItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="Hesap özeti yok"
            description="Bu ortak için henüz hesap özeti oluşturulmamış"
            actionLabel="Hesap Özeti Oluştur"
            onAction={() => setModalVisible(true)}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Statement Modal */}
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
              Yeni Hesap Özeti
            </Text>
            <TouchableOpacity onPress={handleCreateStatement} disabled={saving}>
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
            <View style={styles.monthYearRow}>
              <View style={styles.monthYearField}>
                <Input
                  label="Ay"
                  placeholder="1-12"
                  value={formData.month.toString()}
                  onChangeText={(text) =>
                    setFormData(prev => ({ ...prev, month: parseInt(text) || 1 }))
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.monthYearField}>
                <Input
                  label="Yıl"
                  placeholder="2024"
                  value={formData.year.toString()}
                  onChangeText={(text) =>
                    setFormData(prev => ({ ...prev, year: parseInt(text) || now.getFullYear() }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Input
              label="Önceki Bakiye"
              placeholder="0"
              value={formData.previousBalance.toString()}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, previousBalance: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
            />

            <Input
              label="Kişisel Gider İadesi"
              placeholder="0"
              value={formData.personalExpenseReimbursement > 0 ? formData.personalExpenseReimbursement.toString() : ""}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, personalExpenseReimbursement: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
            />

            <Input
              label="Aylık Maaş"
              placeholder="0"
              value={formData.monthlySalary > 0 ? formData.monthlySalary.toString() : ""}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, monthlySalary: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
            />

            <Input
              label="Kar Payı"
              placeholder="0"
              value={formData.profitShare > 0 ? formData.profitShare.toString() : ""}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, profitShare: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
            />

            <Input
              label="Çekilen Tutar"
              placeholder="0"
              value={formData.actualWithdrawn > 0 ? formData.actualWithdrawn.toString() : ""}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, actualWithdrawn: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
            />

            <View
              style={[
                styles.calculatedBox,
                { backgroundColor: theme.colors.surfaceVariant }
              ]}
            >
              <Text style={[styles.calculatedLabel, { color: theme.colors.textSecondary }]}>
                Hesaplanan Sonraki Ay Bakiyesi
              </Text>
              <Text
                style={[
                  styles.calculatedValue,
                  { color: calculateNextBalance() >= 0 ? theme.colors.success : theme.colors.error }
                ]}
              >
                {formatCurrency(calculateNextBalance())}
              </Text>
            </View>

            <Input
              label="Not (Opsiyonel)"
              placeholder="Ek notlar..."
              value={formData.note || ""}
              onChangeText={(text) => setFormData(prev => ({ ...prev, note: text }))}
              multiline
              numberOfLines={2}
            />

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.md,
    ...SHADOWS.small
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.md
  },
  avatarTextLarge: {
    fontSize: SIZES.font3xl,
    fontWeight: "700"
  },
  partnerInfoSection: {
    flex: 1
  },
  partnerName: {
    fontSize: SIZES.font2xl,
    fontWeight: "700"
  },
  partnerMeta: {
    flexDirection: "row",
    gap: SIZES.xs,
    marginTop: SIZES.xs
  },
  statsContainer: {
    flexDirection: "row",
    padding: SIZES.md,
    marginTop: 1
  },
  statBox: {
    flex: 1,
    alignItems: "center"
  },
  statBoxLabel: {
    fontSize: SIZES.fontSm
  },
  statBoxValue: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    marginTop: 4
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.md,
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
  statementCard: {
    marginBottom: SIZES.sm
  },
  statementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  monthText: {
    fontSize: SIZES.fontLg,
    fontWeight: "600"
  },
  detailsGrid: {
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4
  },
  detailLabel: {
    fontSize: SIZES.fontSm
  },
  detailValue: {
    fontSize: SIZES.fontSm,
    fontWeight: "500"
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1
  },
  resultLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: "500"
  },
  resultValue: {
    fontSize: SIZES.fontLg,
    fontWeight: "700"
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
  monthYearRow: {
    flexDirection: "row",
    gap: SIZES.md
  },
  monthYearField: {
    flex: 1
  },
  calculatedBox: {
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md
  },
  calculatedLabel: {
    fontSize: SIZES.fontSm
  },
  calculatedValue: {
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    marginTop: 4
  },
  bottomPadding: {
    height: 100
  }
});
