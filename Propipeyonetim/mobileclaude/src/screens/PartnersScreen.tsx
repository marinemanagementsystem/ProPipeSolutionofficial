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
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, Card, Badge, EmptyState, LoadingScreen, Input } from "../components";
import { getPartners, createPartner } from "../services";
import { Partner, PartnerFormData } from "../types";
import { formatCurrency, formatPercentage } from "../utils/format";
import { SIZES, SHADOWS } from "../theme";

export const PartnersScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserProfile } = useAuth();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PartnerFormData>({
    name: "",
    sharePercentage: 0,
    baseSalary: 0
  });

  const loadPartners = async () => {
    try {
      const data = await getPartners();
      setPartners(data);
    } catch (error) {
      console.error("Ortaklar yüklenemedi:", error);
      Alert.alert("Hata", "Ortaklar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPartners();
  }, []);

  const handleCreatePartner = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Hata", "Ortak adı zorunludur");
      return;
    }
    if (!currentUserProfile) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı");
      return;
    }

    setSaving(true);
    try {
      await createPartner(formData, currentUserProfile);
      setModalVisible(false);
      setFormData({ name: "", sharePercentage: 0, baseSalary: 0 });
      loadPartners();
      Alert.alert("Başarılı", "Ortak oluşturuldu");
    } catch (error) {
      console.error("Ortak oluşturulamadı:", error);
      Alert.alert("Hata", "Ortak oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const totalSharePercentage = partners.reduce((sum, p) => sum + (p.sharePercentage || 0), 0);
  const totalBalance = partners.reduce((sum, p) => sum + (p.currentBalance || 0), 0);

  const renderPartnerItem = ({ item }: { item: Partner }) => (
    <Card
      style={styles.partnerCard}
      onPress={() => navigation.navigate("PartnerDetail", { partnerId: item.id })}
    >
      <View style={styles.partnerHeader}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: `${theme.colors.primary}20` }
          ]}
        >
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.partnerInfo}>
          <Text style={[styles.partnerName, { color: theme.colors.textPrimary }]}>
            {item.name}
          </Text>
          <View style={styles.partnerMeta}>
            <Badge
              label={formatPercentage(item.sharePercentage)}
              variant="info"
              size="small"
            />
            {!item.isActive && (
              <Badge label="Pasif" variant="error" size="small" />
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      </View>

      <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
            Sabit Maaş
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {formatCurrency(item.baseSalary)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>
            Mevcut Bakiye
          </Text>
          <Text
            style={[
              styles.statValue,
              { color: item.currentBalance >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {formatCurrency(item.currentBalance)}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingScreen message="Ortaklar yükleniyor..." />;
  }

  return (
    <Screen scrollable={false} padding={false}>
      {/* Header Stats */}
      <View style={[styles.headerStats, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerStatItem}>
          <Text style={[styles.headerStatLabel, { color: theme.colors.textSecondary }]}>
            Toplam Ortak
          </Text>
          <Text style={[styles.headerStatValue, { color: theme.colors.textPrimary }]}>
            {partners.length}
          </Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStatItem}>
          <Text style={[styles.headerStatLabel, { color: theme.colors.textSecondary }]}>
            Toplam Hisse
          </Text>
          <Text style={[styles.headerStatValue, { color: theme.colors.primary }]}>
            {formatPercentage(totalSharePercentage)}
          </Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStatItem}>
          <Text style={[styles.headerStatLabel, { color: theme.colors.textSecondary }]}>
            Toplam Bakiye
          </Text>
          <Text
            style={[
              styles.headerStatValue,
              { color: totalBalance >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {formatCurrency(totalBalance)}
          </Text>
        </View>
      </View>

      {/* Partner List */}
      <FlatList
        data={partners}
        keyExtractor={(item) => item.id}
        renderItem={renderPartnerItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Ortak bulunamadı"
            description="Henüz kayıtlı ortak yok"
            actionLabel="Ortak Ekle"
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

      {/* Add Modal */}
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
              Yeni Ortak
            </Text>
            <TouchableOpacity onPress={handleCreatePartner} disabled={saving}>
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
              label="Ortak Adı"
              placeholder="örn. Ahmet"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              leftIcon="person-outline"
            />

            <Input
              label="Hisse Yüzdesi (%)"
              placeholder="örn. 40"
              value={formData.sharePercentage > 0 ? formData.sharePercentage.toString() : ""}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, sharePercentage: parseFloat(text) || 0 }))
              }
              keyboardType="numeric"
              leftIcon="pie-chart-outline"
            />

            <Input
              label="Sabit Maaş (₺)"
              placeholder="örn. 30000"
              value={formData.baseSalary > 0 ? formData.baseSalary.toString() : ""}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, baseSalary: parseFloat(text) || 0 }))
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
                Mevcut toplam hisse: {formatPercentage(totalSharePercentage)}. Yeni ortak eklendiğinde toplam %100'ü geçmediğinden emin olun.
              </Text>
            </View>
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
  headerStatItem: {
    flex: 1,
    alignItems: "center"
  },
  headerStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0"
  },
  headerStatLabel: {
    fontSize: SIZES.fontSm
  },
  headerStatValue: {
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    marginTop: 4
  },
  listContent: {
    padding: SIZES.md,
    paddingBottom: 100
  },
  partnerCard: {
    marginBottom: SIZES.sm
  },
  partnerHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.sm
  },
  avatarText: {
    fontSize: SIZES.fontXl,
    fontWeight: "700"
  },
  partnerInfo: {
    flex: 1
  },
  partnerName: {
    fontSize: SIZES.fontLg,
    fontWeight: "600"
  },
  partnerMeta: {
    flexDirection: "row",
    gap: SIZES.xs,
    marginTop: 4
  },
  statsRow: {
    flexDirection: "row",
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1
  },
  statItem: {
    flex: 1
  },
  statLabel: {
    fontSize: SIZES.fontXs
  },
  statValue: {
    fontSize: SIZES.fontMd,
    fontWeight: "600",
    marginTop: 2
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
