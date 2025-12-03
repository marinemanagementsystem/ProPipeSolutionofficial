import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card, Chip, Button, EmptyState } from '../components';
import { getProjectById, getStatementsByProject, createStatement } from '../services/projects';
import { formatCurrency, formatDate } from '../utils/format';
import type { Project, ProjectStatement } from '../types';
import type { ProjectsStackScreenProps } from '../navigation/types';

type Props = ProjectsStackScreenProps<'ProjectDetail'>;

const ProjectDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [statements, setStatements] = useState<ProjectStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const { colors } = useTheme();
  const { currentUserAuth, isAdmin } = useAuth();

  const loadData = useCallback(async () => {
    try {
      const [projectData, statementsData] = await Promise.all([
        getProjectById(projectId),
        getStatementsByProject(projectId),
      ]);
      setProject(projectData);
      setStatements(statementsData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateStatement = async () => {
    Alert.prompt(
      'Yeni Hakediş',
      'Hakediş başlığını girin:',
      async (title) => {
        if (!title?.trim()) return;

        try {
          setCreating(true);
          const user = currentUserAuth ? {
            uid: currentUserAuth.uid,
            email: currentUserAuth.email || undefined,
            displayName: currentUserAuth.displayName || undefined,
          } : undefined;

          const statementId = await createStatement(
            projectId,
            {
              title: title.trim(),
              date: new Date(),
              previousBalance: project?.currentBalance || 0,
            },
            user
          );

          navigation.navigate('StatementEditor', { projectId, statementId });
        } catch (error) {
          console.error('Error creating statement:', error);
          Alert.alert('Hata', 'Hakediş oluşturulurken bir hata oluştu.');
        } finally {
          setCreating(false);
        }
      },
      'plain-text',
      '',
      'default'
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Tersane bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.content}>
        {/* Project Info Card */}
        <Card style={styles.infoCard} variant="elevated">
          <View style={styles.infoHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="business" size={32} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.projectName, { color: colors.text }]}>{project.name}</Text>
              {project.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                  <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                    {project.location}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Güncel Bakiye</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: project.currentBalance >= 0 ? colors.success : colors.error },
              ]}
            >
              {formatCurrency(project.currentBalance)}
            </Text>
          </View>

          {(project.contactPerson || project.phone) && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.contactSection}>
                {project.contactPerson && (
                  <View style={styles.contactRow}>
                    <Ionicons name="person-outline" size={16} color={colors.textTertiary} />
                    <Text style={[styles.contactText, { color: colors.text }]}>
                      {project.contactPerson}
                    </Text>
                  </View>
                )}
                {project.phone && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={16} color={colors.textTertiary} />
                    <Text style={[styles.contactText, { color: colors.text }]}>{project.phone}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </Card>

        {/* Statements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakedişler</Text>
            {isAdmin && (
              <Button
                title="Yeni Hakediş"
                onPress={handleCreateStatement}
                variant="primary"
                size="small"
                loading={creating}
                icon={<Ionicons name="add" size={16} color="#0f172a" />}
              />
            )}
          </View>

          {statements.length === 0 ? (
            <Card variant="outlined">
              <EmptyState
                icon="document-text-outline"
                title="Hakediş bulunamadı"
                description="Bu tersane için henüz hakediş kaydı yok."
              />
            </Card>
          ) : (
            statements.map((statement) => (
              <TouchableOpacity
                key={statement.id}
                onPress={() =>
                  navigation.navigate('StatementEditor', {
                    projectId,
                    statementId: statement.id,
                  })
                }
                activeOpacity={0.7}
              >
                <Card style={styles.statementCard} variant="outlined">
                  <View style={styles.statementHeader}>
                    <View style={styles.statementInfo}>
                      <Text style={[styles.statementTitle, { color: colors.text }]}>
                        {statement.title}
                      </Text>
                      <Text style={[styles.statementDate, { color: colors.textSecondary }]}>
                        {formatDate(statement.date)}
                      </Text>
                    </View>
                    <Chip
                      label={statement.status === 'CLOSED' ? 'Kapalı' : 'Taslak'}
                      variant={statement.status === 'CLOSED' ? 'success' : 'warning'}
                      size="small"
                    />
                  </View>

                  <View style={styles.statementTotals}>
                    <View style={styles.totalItem}>
                      <Text style={[styles.totalLabel, { color: colors.textTertiary }]}>Gelir</Text>
                      <Text style={[styles.totalValue, { color: colors.success }]}>
                        {formatCurrency(statement.totals.totalIncome)}
                      </Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={[styles.totalLabel, { color: colors.textTertiary }]}>Gider</Text>
                      <Text style={[styles.totalValue, { color: colors.error }]}>
                        {formatCurrency(statement.totals.totalExpensePaid + statement.totals.totalExpenseUnpaid)}
                      </Text>
                    </View>
                    <View style={styles.totalItem}>
                      <Text style={[styles.totalLabel, { color: colors.textTertiary }]}>Net</Text>
                      <Text
                        style={[
                          styles.totalValue,
                          { color: statement.totals.netCashReal >= 0 ? colors.success : colors.error },
                        ]}
                      >
                        {formatCurrency(statement.totals.netCashReal)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  contactSection: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statementCard: {
    marginBottom: 12,
  },
  statementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statementInfo: {
    flex: 1,
    marginRight: 12,
  },
  statementTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  statementDate: {
    fontSize: 13,
    marginTop: 2,
  },
  statementTotals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProjectDetailScreen;
