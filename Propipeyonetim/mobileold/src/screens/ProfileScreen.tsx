import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Surface, Text, useTheme } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { profile, logout } = useAuth();

  const initials =
    profile?.displayName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2) || "PP";

  const cardStyle = [
    styles.card,
    styles.shadow,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant },
  ];

  return (
    <Screen title="Profil" subtitle="Hesap bilgileri ve oturum">
      <Surface style={cardStyle} elevation={0}>
        <View style={styles.header}>
          <Avatar.Text size={64} label={initials} />
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={styles.title}>
              {profile?.displayName || "Kullanici"}
            </Text>
            <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
              {profile?.email}
            </Text>
            <Text style={styles.role}>{profile?.role || "Kullanici"}</Text>
          </View>
        </View>
        <Button
          mode="contained-tonal"
          onPress={logout}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Cikis Yap
        </Button>
      </Surface>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  header: { flexDirection: "row", gap: 12, alignItems: "center" },
  title: { fontWeight: "700" },
  muted: { color: "#94a3b8" },
  role: { color: "#22d3ee", marginTop: 4 },
  button: { marginTop: 12, borderRadius: 12 },
});

export default ProfileScreen;
