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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, Card, Badge, EmptyState, LoadingScreen, Input } from "../components";
import {
  getProjectById,
  getProjectStatements,
  createStatement
} from "../services";
import { Project, ProjectStatement, StatementFormData } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { SIZES, SHADOWS } from "../theme";

type ProjectDetailRouteProp = RouteProp<{ ProjectDetail: { projectId: string } }, "ProjectDetail">;

export const ProjectDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserProfile } = useAuth();
  const route = useRoute<ProjectDetailRouteProp>();
  const navigation = useNavigation<any>();

  const { projectId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [statements, setStatements] = useState<ProjectStatement[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState<StatementFormData>({
    title: "",
    date: new Date(),
    previousBalance: 0
  });

  const loadData = async () => {
    try {
      const [projectData, statementsData] = await Promise.all([
        getProjectById(projectId),
        getProjectStatements(projectId)
      ]);
      setProject(projectData);
      setStatements(statementsData);
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
  }, [projectId]);

  useEffect(() => {
    if (project) {
      navigation.setOptions({ title: project.name });
    }
  }, [project]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [projectId]);

  const handleCreateStatement = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Hata", "Hakediş başlığı zorunludur");
      return;
    }
    if (!currentUserProfile) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı");
      return;
    }

    setSaving(true);
    try {
      await createStatement(projectId, formData, currentUserProfile);
      setModalVisible(false);
      setFormData({ title: "", date: new Date(), previousBalance: project?.currentBalance || 0 });
      loadData();
      Alert.alert("Başarılı", "Hakediş dosyası oluşturuldu");
    } catch (error) {
      console.error("Hakediş oluşturulamadı:", error);
      Alert.alert("Hata", "Hakediş oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      date: new Date(),
      previousBalance: project?.currentBalance || 0
    });
    setModalVisible(true);
  };

  const getStatusVariant = (status: string) => {
    return status === "CLOSED" ? "success" : "warning";
  };

  const renderStatementItem = ({ item }: { item: ProjectStatement }) => (
    <Card
      style={styles.statementCard}
      onPress={() =>
        navigation.navigate("StatementEditor", {
          projectId,
          statementId: item.id
        })
      }
    >
      <View style={styles.statementHeader}>
        <View style={styles.statementInfo}>
          <Text style={[styles.statementTitle, { color: theme.colors.textPrimary }]}>
            {item.title}
          </Text>
          <Text style={[styles.statementDate, { color: theme.colors.textTertiary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <Badge
          label={item.status === "CLOSED" ? "Kapalı" : "Taslak"}
          variant={getStatusVariant(item.status)}
          size="small"
        />
      </View>

      <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statColumn}>
          <Text style={[styles.statColLabel, { color: theme.colors.textTertiary }]}>
            Gelir
          </Text>
          <Text style={[styles.statColValue, { color: theme.colors.success }]}>
            {formatCurrency(item.totals?.totalIncome || 0)}
          </Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={[styles.statColLabel, { color: theme.colors.textTertiary }]}>
            Gider
          </Text>
          <Text style={[styles.statColValue, { color: theme.colors.error }]}>
            {formatCurrency((item.totals?.totalExpensePaid || 0) + (item.totals?.totalExpenseUnpaid || 0))}
          </Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={[styles.statColLabel, { color: theme.colors.textTertiary }]}>
            Net
          </Text>
          <Text
            style={[
              styles.statColValue,
              {
                color:
                  (item.totals?.netCashReal || 0) >= 0
                    ? theme.colors.success
                    : theme.colors.error
              }
            ]}
          >
            {formatCurrency(item.totals?.netCashReal || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.balancesRow}>
        <Text style={[styles.balanceText, { color: theme.colors.textSecondary }]}>
          Önceki: {formatCurrency(item.previousBalance || 0)}
        </Text>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.textTertiary} />
        <Text
          style={[
            styles.balanceText,
            {
              color:
                (item.finalBalance || 0) >= 0 ? theme.colors.success : theme.colors.error,
              fontWeight: "600"
            }
          ]}
        >
          Final: {formatCurrency(item.finalBalance || 0)}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingScreen message="Tersane yükleniyor..." />;
  }

  if (!project) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Tersane bulunamadı"
          description="Bu tersane mevcut değil veya silinmiş olabilir"
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} padding={false} refreshing={refreshing} onRefresh={onRefresh}>
      {/* Project Info Header */}
      <View style={[styles.projectHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.projectIconLarge}>
          <Ionicons name="boat" size={32} color={theme.colors.primary} />
        </View>
        <View style={styles.projectInfoHeader}>
          <Text style={[styles.projectName, { color: theme.colors.textPrimary }]}>
            {project.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textTertiary} />
            <Text style={[styles.projectLocation, { color: theme.colors.textTertiary }]}>
              {project.location}
            </Text>
          </View>
        </View>
        <View style={styles.balanceBox}>
          <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
            İç Bakiye
          </Text>
          <Text
            style={[
              styles.balanceValue,
              { color: project.currentBalance >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {formatCurrency(project.currentBalance)}
          </Text>
        </View>
      </View>

      {/* Statements Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Hakediş Dosyaları
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
            title="Hakediş dosyası yok"
            description="Bu tersane için henüz hakediş dosyası oluşturulmamış"
            actionLabel="Hakediş Oluştur"
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
              Yeni Hakediş
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
            <Input
              label="Hakediş Başlığı"
              placeholder="örn. Temmuz 1. Ara Hakediş"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              leftIcon="document-text-outline"
            />

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Tarih
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textTertiary} />
                <Text style={[styles.dateText, { color: theme.colors.textPrimary }]}>
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

            <Input
              label="Önceki Bakiye"
              placeholder="0"
              value={formData.previousBalance.toString()}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, previousBalance: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
              leftIcon="wallet-outline"
            />

            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.colors.surfaceVariant }
              ]}
            >
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.info} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Önceki bakiye, tersanenin mevcut iç bakiyesi ({formatCurrency(project.currentBalance)}) olarak ayarlanmıştır.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.md,
    ...SHADOWS.small
  },
  projectIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#0891b220",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.sm
  },
  projectInfoHeader: {
    flex: 1
  },
  projectName: {
    fontSize: SIZES.fontXl,
    fontWeight: "700"
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4
  },
  projectLocation: {
    fontSize: SIZES.fontSm
  },
  balanceBox: {
    alignItems: "flex-end"
  },
  balanceLabel: {
    fontSize: SIZES.fontSm
  },
  balanceValue: {
    fontSize: SIZES.fontXl,
    fontWeight: "700"
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
    alignItems: "flex-start"
  },
  statementInfo: {
    flex: 1
  },
  statementTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: "600"
  },
  statementDate: {
    fontSize: SIZES.fontSm,
    marginTop: 2
  },
  statsRow: {
    flexDirection: "row",
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1
  },
  statColumn: {
    flex: 1,
    alignItems: "center"
  },
  statColLabel: {
    fontSize: SIZES.fontXs
  },
  statColValue: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    marginTop: 2
  },
  balancesRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SIZES.sm,
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm
  },
  balanceText: {
    fontSize: SIZES.fontSm
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
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm
  },
  dateText: {
    fontSize: SIZES.fontMd
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm,
    marginTop: SIZES.sm
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    lineHeight: 18
  }
});
