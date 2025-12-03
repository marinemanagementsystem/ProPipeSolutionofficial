import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, Card, Badge, EmptyState, LoadingScreen, Input } from "../components";
import {
  getNetworkContacts,
  createNetworkContact,
  updateNetworkContact,
  deleteNetworkContact
} from "../services";
import {
  NetworkContact,
  NetworkContactFormData,
  NetworkCategory,
  ContactStatus,
  QuoteStatus,
  getCategoryLabel,
  getContactStatusLabel,
  getQuoteStatusLabel,
  getResultStatusLabel
} from "../types";
import { formatDate } from "../utils/format";
import { SIZES, SHADOWS } from "../theme";

export const NetworkScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUserProfile, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<NetworkContact | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<"lastContact" | "nextAction" | null>(null);

  // Form state
  const [formData, setFormData] = useState<NetworkContactFormData>({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    category: "YENI_INSA",
    contactStatus: "BEKLEMEDE",
    quoteStatus: "HAYIR",
    notes: ""
  });

  const loadContacts = async () => {
    try {
      const data = await getNetworkContacts(showDeleted);
      setContacts(data);
    } catch (error) {
      console.error("Network kayıtları yüklenemedi:", error);
      Alert.alert("Hata", "Kayıtlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [showDeleted]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts();
  }, [showDeleted]);

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      category: "YENI_INSA",
      contactStatus: "BEKLEMEDE",
      quoteStatus: "HAYIR",
      notes: ""
    });
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (contact: NetworkContact) => {
    setEditingContact(contact);
    setFormData({
      companyName: contact.companyName,
      contactPerson: contact.contactPerson,
      phone: contact.phone || "",
      email: contact.email || "",
      category: contact.category,
      contactStatus: contact.contactStatus,
      quoteStatus: contact.quoteStatus,
      result: contact.result,
      lastContactDate: contact.lastContactDate?.toDate(),
      nextActionDate: contact.nextActionDate?.toDate(),
      notes: contact.notes || ""
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      Alert.alert("Hata", "Firma adı zorunludur");
      return;
    }
    if (!formData.contactPerson.trim()) {
      Alert.alert("Hata", "İletişim kişisi zorunludur");
      return;
    }
    if (!currentUserProfile) {
      Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı");
      return;
    }

    setSaving(true);
    try {
      if (editingContact) {
        await updateNetworkContact(editingContact.id, formData, currentUserProfile);
      } else {
        await createNetworkContact(formData, currentUserProfile);
      }
      setModalVisible(false);
      resetForm();
      loadContacts();
      Alert.alert("Başarılı", editingContact ? "Kayıt güncellendi" : "Kayıt eklendi");
    } catch (error) {
      console.error("Kayıt kaydedilemedi:", error);
      Alert.alert("Hata", "Kayıt kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (contact: NetworkContact) => {
    Alert.alert(
      "Kaydı Sil",
      `"${contact.companyName}" kaydını silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (!currentUserProfile) return;
            try {
              await deleteNetworkContact(contact.id, currentUserProfile);
              loadContacts();
              Alert.alert("Başarılı", "Kayıt silindi");
            } catch (error) {
              Alert.alert("Hata", "Kayıt silinirken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContactStatusColor = (status: ContactStatus) => {
    const colors: Record<ContactStatus, string> = {
      ULASILDI: theme.colors.success,
      ULASILMIYOR: theme.colors.error,
      BEKLEMEDE: theme.colors.warning
    };
    return colors[status];
  };

  const getQuoteStatusVariant = (status: QuoteStatus) => {
    const variants: Record<QuoteStatus, "default" | "success" | "warning" | "error" | "info" | "secondary"> = {
      HAYIR: "error",
      TEKLIF_BEKLENIYOR: "warning",
      TEKLIF_VERILDI: "success",
      TEKLIF_VERILECEK: "info",
      GORUSME_DEVAM_EDIYOR: "secondary"
    };
    return variants[status];
  };

  const renderContactItem = ({ item }: { item: NetworkContact }) => (
    <Card
      style={[styles.contactCard, item.isDeleted && styles.deletedCard]}
      onPress={() => !item.isDeleted && openEditModal(item)}
    >
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={[styles.companyName, { color: theme.colors.textPrimary }]}>
            {item.companyName}
          </Text>
          <Text style={[styles.personName, { color: theme.colors.textSecondary }]}>
            {item.contactPerson}
          </Text>
        </View>
        <Badge
          label={getCategoryLabel(item.category)}
          variant="info"
          size="small"
        />
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getContactStatusColor(item.contactStatus) }
            ]}
          />
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            {getContactStatusLabel(item.contactStatus)}
          </Text>
        </View>
        <Badge
          label={getQuoteStatusLabel(item.quoteStatus)}
          variant={getQuoteStatusVariant(item.quoteStatus)}
          size="small"
        />
      </View>

      {(item.phone || item.nextActionDate) && (
        <View style={[styles.contactFooter, { borderTopColor: theme.colors.border }]}>
          {item.phone && (
            <TouchableOpacity
              style={styles.phoneBtn}
              onPress={() => handleCall(item.phone!)}
            >
              <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.phoneText, { color: theme.colors.primary }]}>
                {item.phone}
              </Text>
            </TouchableOpacity>
          )}
          {item.nextActionDate && (
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textTertiary} />
              <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
                {formatDate(item.nextActionDate)}
              </Text>
            </View>
          )}
        </View>
      )}

      {!item.isDeleted && (
        <TouchableOpacity
          style={styles.deleteIconBtn}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </Card>
  );

  if (loading) {
    return <LoadingScreen message="Network kayıtları yükleniyor..." />;
  }

  return (
    <Screen scrollable={false} padding={false}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBox, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Ionicons name="search-outline" size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Firma veya kişi ara..."
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

      {/* Contact List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Kayıt bulunamadı"
            description={
              searchQuery
                ? "Arama kriterlerinize uygun kayıt yok"
                : "Henüz network kaydı eklenmemiş"
            }
            actionLabel={searchQuery ? undefined : "Kayıt Ekle"}
            onAction={searchQuery ? undefined : openAddModal}
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
              {editingContact ? "Kaydı Düzenle" : "Yeni Kayıt"}
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
              label="Firma Adı"
              placeholder="Firma adını girin"
              value={formData.companyName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
              leftIcon="business-outline"
            />

            <Input
              label="İletişim Kişisi"
              placeholder="İletişim kişisi adını girin"
              value={formData.contactPerson}
              onChangeText={(text) => setFormData(prev => ({ ...prev, contactPerson: text }))}
              leftIcon="person-outline"
            />

            <Input
              label="Telefon"
              placeholder="Telefon numarası"
              value={formData.phone || ""}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />

            <Input
              label="E-posta"
              placeholder="E-posta adresi"
              value={formData.email || ""}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Kategori
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {(["YENI_INSA", "TAMIR", "YAT", "ASKERI_PROJE", "TANKER", "DIGER"] as NetworkCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            formData.category === cat
                              ? theme.colors.primary
                              : theme.colors.surfaceVariant
                        }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                    >
                      <Text
                        style={{
                          color: formData.category === cat ? "#fff" : theme.colors.textSecondary,
                          fontSize: SIZES.fontSm
                        }}
                      >
                        {getCategoryLabel(cat)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                İletişim Durumu
              </Text>
              <View style={styles.chipRow}>
                {(["ULASILDI", "ULASILMIYOR", "BEKLEMEDE"] as ContactStatus[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          formData.contactStatus === status
                            ? getContactStatusColor(status)
                            : theme.colors.surfaceVariant
                      }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, contactStatus: status }))}
                  >
                    <Text
                      style={{
                        color:
                          formData.contactStatus === status ? "#fff" : theme.colors.textSecondary,
                        fontSize: SIZES.fontSm
                      }}
                    >
                      {getContactStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Teklif Durumu
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {(["HAYIR", "TEKLIF_BEKLENIYOR", "TEKLIF_VERILDI", "TEKLIF_VERILECEK", "GORUSME_DEVAM_EDIYOR"] as QuoteStatus[]).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.chip,
                        {
                          backgroundColor:
                            formData.quoteStatus === status
                              ? theme.colors.secondary
                              : theme.colors.surfaceVariant
                        }
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, quoteStatus: status }))}
                    >
                      <Text
                        style={{
                          color:
                            formData.quoteStatus === status ? "#fff" : theme.colors.textSecondary,
                          fontSize: SIZES.fontSm
                        }}
                      >
                        {getQuoteStatusLabel(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: theme.colors.textSecondary }]}>
                Sonraki Arama Tarihi
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => setShowDatePicker("nextAction")}
              >
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textTertiary} />
                <Text style={[styles.dateButtonText, { color: theme.colors.textPrimary }]}>
                  {formData.nextActionDate ? formatDate(formData.nextActionDate) : "Tarih seçin"}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker === "nextAction" && (
              <DateTimePicker
                value={formData.nextActionDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(null);
                  if (date) setFormData(prev => ({ ...prev, nextActionDate: date }));
                }}
              />
            )}

            <Input
              label="Notlar"
              placeholder="Ek notlar..."
              value={formData.notes || ""}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
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
  filters: {
    flexDirection: "row",
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
    marginBottom: SIZES.sm
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
  contactCard: {
    marginBottom: SIZES.sm
  },
  deletedCard: {
    opacity: 0.6
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  contactInfo: {
    flex: 1
  },
  companyName: {
    fontSize: SIZES.fontLg,
    fontWeight: "600"
  },
  personName: {
    fontSize: SIZES.fontSm,
    marginTop: 2
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.sm
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: SIZES.fontSm
  },
  contactFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1
  },
  phoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  phoneText: {
    fontSize: SIZES.fontSm
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  dateText: {
    fontSize: SIZES.fontSm
  },
  deleteIconBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: SIZES.xs
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
  chipRow: {
    flexDirection: "row",
    gap: SIZES.xs,
    flexWrap: "wrap"
  },
  chip: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusMd
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.sm
  },
  dateButtonText: {
    fontSize: SIZES.fontMd
  },
  bottomPadding: {
    height: 100
  }
});
