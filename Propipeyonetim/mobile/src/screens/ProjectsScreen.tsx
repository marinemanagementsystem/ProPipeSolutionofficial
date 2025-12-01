import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";
import { fetchProjects } from "../services/dashboard";
import type { Project } from "../types";
import { formatCurrency } from "../utils/format";

const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error("Projects failed", err);
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
        <Text style={styles.muted}>Projeler yükleniyor...</Text>
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
      {projects.map((project) => (
        <Surface key={project.id} style={styles.card} elevation={1}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.title}>
                {project.name}
              </Text>
              {project.location && (
                <Text style={styles.muted}>{project.location}</Text>
              )}
              {project.status && (
                <Text style={styles.status}>{project.status}</Text>
              )}
            </View>
            <View style={styles.alignRight}>
              <Text variant="titleLarge">
                {formatCurrency(project.currentBalance || 0)}
              </Text>
              <Text style={styles.muted}>Güncel bakiye</Text>
            </View>
          </View>
        </Surface>
      ))}
      {projects.length === 0 && (
        <Text style={styles.muted}>Henüz proje bulunmuyor.</Text>
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
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { fontWeight: "700" },
  muted: { color: "#94a3b8" },
  status: { color: "#22d3ee", marginTop: 4 },
  alignRight: { alignItems: "flex-end" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default ProjectsScreen;
