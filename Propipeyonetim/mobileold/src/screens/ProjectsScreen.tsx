import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { fetchProjects } from "../services/dashboard";
import type { Project } from "../types";
import { formatCurrency } from "../utils/format";
import Screen from "../components/Screen";

const ProjectsScreen: React.FC = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
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
        <Text style={styles.muted}>Projeler yukleniyor...</Text>
      </View>
    );
  }

  return (
    <Screen
      title="Tersaneler"
      subtitle="Aktif projeler ve bakiyeler"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {projects.map((project) => (
        <Surface key={project.id} style={cardStyle} elevation={0}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.title}>
                {project.name}
              </Text>
              {project.location && (
                <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
                  {project.location}
                </Text>
              )}
              {project.status && (
                <Text style={styles.status}>{project.status}</Text>
              )}
            </View>
            <View style={styles.alignRight}>
              <Text variant="titleLarge">
                {formatCurrency(project.currentBalance || 0)}
              </Text>
              <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
                Guncel bakiye
              </Text>
            </View>
          </View>
        </Surface>
      ))}
      {projects.length === 0 && (
        <Text style={[styles.muted, { color: theme.colors.onSurfaceDisabled }]}>
          Henuz proje bulunmuyor.
        </Text>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
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
