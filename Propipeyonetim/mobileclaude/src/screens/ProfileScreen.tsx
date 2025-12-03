import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Screen, Card, ListItem } from "../components";
import { SIZES, SHADOWS } from "../theme";

export const ProfileScreen: React.FC = () => {
  const { theme, mode, toggleTheme } = useTheme();
  const { currentUserProfile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu");
            }
          }
        }
      ]
    );
  };

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      ADMIN: "Yönetici",
      super_admin: "Süper Yönetici",
      ORTAK: "Ortak",
      MUHASEBE: "Muhasebe"
    };
    return labels[role || ""] || role || "Bilinmiyor";
  };

  const getRoleColor = (role?: string) => {
    const colors: Record<string, string> = {
      ADMIN: theme.colors.primary,
      super_admin: theme.colors.secondary,
      ORTAK: theme.colors.info,
      MUHASEBE: theme.colors.warning
    };
    return colors[role || ""] || theme.colors.textSecondary;
  };

  return (
    <Screen>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: `${theme.colors.primary}20` }
          ]}
        >
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {currentUserProfile?.displayName?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
          {currentUserProfile?.displayName || "Kullanıcı"}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {currentUserProfile?.email}
        </Text>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: `${getRoleColor(currentUserProfile?.role)}20` }
          ]}
        >
          <Text style={[styles.roleText, { color: getRoleColor(currentUserProfile?.role) }]}>
            {getRoleLabel(currentUserProfile?.role)}
          </Text>
        </View>
      </View>

      {/* Settings */}
      <Card title="Ayarlar" style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons
              name={mode === "dark" ? "moon" : "sunny"}
              size={22}
              color={theme.colors.primary}
            />
            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
              Karanlık Mod
            </Text>
          </View>
          <Switch
            value={mode === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      {/* App Info */}
      <Card title="Uygulama" style={styles.section}>
        <ListItem
          title="Sürüm"
          rightContent={
            <Text style={{ color: theme.colors.textTertiary }}>1.0.0</Text>
          }
          bottomBorder={true}
        />
        <ListItem
          title="Geliştirici"
          rightContent={
            <Text style={{ color: theme.colors.textTertiary }}>Propipe Solution</Text>
          }
          bottomBorder={false}
        />
      </Card>

      {/* Account Actions */}
      <Card style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Footer */}
      <Text style={[styles.footer, { color: theme.colors.textTertiary }]}>
        Propipe Yönetim © {new Date().getFullYear()}
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    paddingVertical: SIZES.xl,
    marginBottom: SIZES.md
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.md
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700"
  },
  userName: {
    fontSize: SIZES.font2xl,
    fontWeight: "700"
  },
  userEmail: {
    fontSize: SIZES.fontMd,
    marginTop: 4
  },
  roleBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
    marginTop: SIZES.sm
  },
  roleText: {
    fontSize: SIZES.fontSm,
    fontWeight: "600"
  },
  section: {
    marginBottom: SIZES.md
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm
  },
  settingLabel: {
    fontSize: SIZES.fontMd
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.sm,
    paddingVertical: SIZES.sm
  },
  logoutText: {
    fontSize: SIZES.fontMd,
    fontWeight: "600"
  },
  footer: {
    textAlign: "center",
    fontSize: SIZES.fontSm,
    marginTop: SIZES.lg
  }
});
