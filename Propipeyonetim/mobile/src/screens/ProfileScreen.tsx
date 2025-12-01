import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Surface, Text } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

const ProfileScreen: React.FC = () => {
  const { profile, logout } = useAuth();

  const initials =
    profile?.displayName
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2) || "PP";

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.header}>
          <Avatar.Text size={64} label={initials} />
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={styles.title}>
              {profile?.displayName || "Kullanıcı"}
            </Text>
            <Text style={styles.muted}>{profile?.email}</Text>
            <Text style={styles.role}>{profile?.role}</Text>
          </View>
        </View>
        <Button
          mode="contained-tonal"
          onPress={logout}
          style={styles.button}
          contentStyle={{ paddingVertical: 6 }}
        >
          Çıkış Yap
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    backgroundColor: "#0f172a",
  },
  header: { flexDirection: "row", gap: 12, alignItems: "center" },
  title: { fontWeight: "700" },
  muted: { color: "#94a3b8" },
  role: { color: "#22d3ee", marginTop: 4 },
  button: { marginTop: 12, borderRadius: 12 },
});

export default ProfileScreen;
