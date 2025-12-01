import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Chip, Surface, Text } from "react-native-paper";
import { fetchUpcomingNetworkActions } from "../services/dashboard";
import type { NetworkAction } from "../types";
import { formatDate } from "../utils/format";

const NetworkScreen: React.FC = () => {
  const [items, setItems] = useState<NetworkAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        <Text style={styles.muted}>Network verileri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {items.map((item) => (
        <Surface key={item.id} style={styles.card} elevation={1}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.title}>
                {item.companyName}
              </Text>
              <Text style={styles.muted}>{item.contactPerson}</Text>
              {item.phone && <Text style={styles.muted}>{item.phone}</Text>}
            </View>
            <View style={styles.alignRight}>
              <Chip compact>{item.category || "Kategori yok"}</Chip>
              <Text
                style={[
                  styles.date,
                  item.isOverdue && { color: "#ef4444" },
                ]}
              >
                {item.nextActionDate
                  ? formatDate(item.nextActionDate)
                  : "Takip yok"}
              </Text>
            </View>
          </View>
          {item.quoteStatus && (
            <Text style={styles.muted}>Teklif: {item.quoteStatus}</Text>
          )}
          {item.result && <Text style={styles.muted}>Durum: {item.result}</Text>}
        </Surface>
      ))}
      {items.length === 0 && (
        <Text style={styles.muted}>
          Önümüzdeki 7 gün için bekleyen takip yok.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    gap: 6,
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
