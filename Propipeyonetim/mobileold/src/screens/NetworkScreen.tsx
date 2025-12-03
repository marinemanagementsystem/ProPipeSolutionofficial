import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Chip, Surface, Text, useTheme } from "react-native-paper";
import { fetchUpcomingNetworkActions } from "../services/dashboard";
import type { NetworkAction } from "../types";
import { formatDate } from "../utils/format";
import Screen from "../components/Screen";

const NetworkScreen: React.FC = () => {
  const theme = useTheme();
  const [items, setItems] = useState<NetworkAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cardStyle = [
    styles.card,
    styles.shadow,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUpcomingNetworkActions();
      setItems(data);
    } catch (err) {
      console.error("Network failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Network verileri yukleniyor...</Text>
      </View>
    );
  }

  return (
    <Screen
      title="Network"
      subtitle="Takip gereken gorusmeler"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {items.map((item) => (
        <Surface key={item.id} style={cardStyle} elevation={0}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.title}>
                {item.companyName}
              </Text>
              <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
                {item.contactPerson}
              </Text>
              {item.phone && (
                <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>{item.phone}</Text>
              )}
            </View>
            <View style={styles.alignRight}>
              <Chip compact>{item.category || "Kategori yok"}</Chip>
              <Text
                style={[
                  styles.date,
                  item.isOverdue && { color: theme.colors.error },
                ]}
              >
                {item.nextActionDate ? formatDate(item.nextActionDate) : "Takip yok"}
              </Text>
            </View>
          </View>
          {item.quoteStatus && (
            <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
              Teklif: {item.quoteStatus}
            </Text>
          )}
          {item.result && (
            <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
              Durum: {item.result}
            </Text>
          )}
        </Surface>
      ))}
      {items.length === 0 && (
        <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
          Onumuzdeki 7 gun icin bekleyen takip yok.
        </Text>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  row: { flexDirection: "row", gap: 12 },
  title: { fontWeight: "700" },
  muted: { color: "#94a3b8" },
  alignRight: { alignItems: "flex-end", gap: 6 },
  date: { marginTop: 4, color: "#e2e8f0" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default NetworkScreen;
