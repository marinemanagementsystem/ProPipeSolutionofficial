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
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, Card, Badge, EmptyState, LoadingScreen, Input, Button } from "../components";
import { getProjects, createProject } from "../services";
import { Project, ProjectFormData } from "../types";
import { formatCurrency } from "../utils/format";
import { SIZES, SHADOWS } from "../theme";

export const ProjectsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserProfile } = useAuth();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    location: ""
  });

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Tersaneler yüklenemedi:", error);
      Alert.alert("Hata", "Tersaneler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Hata", "Tersane adı zorunludur");
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert("Hata", "Konum zorunludur");
      return;
    }
    if (!currentUserProfile) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı");
      return;
    }

    setSaving(true);
    try {
      await createProject(formData, currentUserProfile);
      setModalVisible(false);
      setFormData({ name: "", location: "" });
      loadProjects();
      Alert.alert("Başarılı", "Tersane oluşturuldu");
    } catch (error) {
      console.error("Tersane oluşturulamadı:", error);
      Alert.alert("Hata", "Tersane oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = projects.reduce((sum, p) => sum + (p.currentBalance || 0), 0);
  const positiveCount = projects.filter((p) => p.currentBalance > 0).length;

  const renderProjectItem = ({ item }: { item: Project }) => (
    <Card
      style={styles.projectCard}
      onPress={() => navigation.navigate("ProjectDetail", { projectId: item.id })}
    >
      <View style={styles.projectHeader}>
        <View
          style={[
            styles.projectIcon,
            { backgroundColor: `${theme.colors.primary}20` }
          ]}
        >
          <Ionicons name="boat" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.projectInfo}>
          <Text style={[styles.projectName, { color: theme.colors.textPrimary }]}>
            {item.name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.projectLocation, { color: theme.colors.textTertiary }]}>
              {item.location}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      </View>

      <View style={[styles.balanceSection, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
          İç Bakiye
        </Text>
        <Text
          style={[
            styles.balanceValue,
            {
              color: item.currentBalance >= 0 ? theme.colors.success : theme.colors.error
            }
          ]}
        >
          {formatCurrency(item.currentBalance || 0)}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingScreen message="Tersaneler yükleniyor..." />;
  }

  return (
    <Screen scrollable={false} padding={false}>
      {/* Header Stats */}
      <View style={[styles.headerStats, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Toplam Tersane
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {projects.length}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Toplam Bakiye
          </Text>
          <Text
            style={[
              styles.statValue,
              { color: totalBalance >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {formatCurrency(totalBalance)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pozitif
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {positiveCount}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBox, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Tersane ara..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Project List */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="boat-outline"
            title="Tersane bulunamadı"
            description={
              searchQuery
                ? "Arama kriterlerinize uygun tersane yok"
                : "Henüz kayıtlı tersane yok"
            }
            actionLabel={searchQuery ? undefined : "Tersane Ekle"}
            onAction={searchQuery ? undefined : () => setModalVisible(true)}
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
              Yeni Tersane
            </Text>
            <TouchableOpacity onPress={handleCreateProject} disabled={saving}>
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
              label="Tersane Adı"
              placeholder="örn. SANMAR"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              leftIcon="boat-outline"
            />

            <Input
              label="Konum"
              placeholder="örn. Tuzla"
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              leftIcon="location-outline"
            />
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
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0"
  },
  statLabel: {
    fontSize: SIZES.fontSm
  },
  statValue: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    marginTop: 4
  },
  searchContainer: {
    padding: SIZES.md
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.fontMd
  },
  listContent: {
    padding: SIZES.md,
    paddingBottom: 100
  },
  projectCard: {
    marginBottom: SIZES.sm
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.sm
  },
  projectInfo: {
    flex: 1
  },
  projectName: {
    fontSize: SIZES.fontLg,
    fontWeight: "600"
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4
  },
  projectLocation: {
    fontSize: SIZES.fontSm
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1
  },
  balanceLabel: {
    fontSize: SIZES.fontSm
  },
  balanceValue: {
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
  }
});
