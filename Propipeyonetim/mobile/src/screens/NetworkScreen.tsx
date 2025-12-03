import React, { useCallback, useEffect, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  ActivityIndicator,
  useColorScheme,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchAllNetworkActions } from "../services/dashboard";
import type { NetworkAction } from "../types";
import { formatDate } from "../utils/format";
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from "../theme";

const NetworkScreen: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  
  const [items, setItems] = useState<NetworkAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAllNetworkActions();
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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getStatusColor = (item: NetworkAction) => {
    if (item.isOverdue) return colors.error;
    if (item.quoteStatus === "ACCEPTED") return colors.success;
    if (item.quoteStatus === "PENDING") return colors.warning;
    return colors.primary;
  };

  const renderItem = ({ item }: { item: NetworkAction }) => {
    const statusColor = getStatusColor(item);
    
    return (
      <TouchableOpacity 
        style={[
          styles.card, 
          { 
            backgroundColor: isDark ? "#1e293b" : colors.white,
            borderLeftColor: statusColor,
          }
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.companyInfo}>
            <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons name="business" size={20} color={statusColor} />
            </View>
            <View style={styles.companyText}>
              <Text style={[styles.companyName, { color: isDark ? "#f8fafc" : colors.text }]}>
                {item.companyName}
              </Text>
              {item.contactPerson && (
                <Text style={[styles.contactPerson, { color: isDark ? "#94a3b8" : colors.textSecondary }]}>
                  {item.contactPerson}
                </Text>
              )}
            </View>
          </View>
          
          {item.phone && (
            <TouchableOpacity 
              style={[styles.callButton, { backgroundColor: `${colors.success}15` }]}
              onPress={() => handleCall(item.phone!)}
            >
              <Ionicons name="call" size={18} color={colors.success} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardBody}>
          {item.category && (
            <View style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {item.category}
              </Text>
            </View>
          )}
          
          {item.quoteStatus && (
            <View style={[styles.badge, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons name="document-text" size={12} color={statusColor} />
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {item.quoteStatus === "ACCEPTED" ? "Kabul" : 
                 item.quoteStatus === "PENDING" ? "Beklemede" : 
                 item.quoteStatus === "REJECTED" ? "Red" : item.quoteStatus}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <Ionicons 
              name={item.isOverdue ? "alert-circle" : "calendar-outline"} 
              size={14} 
              color={item.isOverdue ? colors.error : (isDark ? "#94a3b8" : colors.textSecondary)} 
            />
            <Text style={[
              styles.dateText,
              { color: item.isOverdue ? colors.error : (isDark ? "#94a3b8" : colors.textSecondary) }
            ]}>
              {item.nextActionDate ? formatDate(item.nextActionDate) : "Takip tarihi yok"}
            </Text>
            {item.isOverdue && (
              <View style={[styles.overdueBadge]}>
                <Text style={styles.overdueText}>Gecikmiş</Text>
              </View>
            )}
          </View>
          
          {item.result && (
            <Text 
              style={[styles.resultText, { color: isDark ? "#64748b" : colors.textLight }]}
              numberOfLines={1}
            >
              {item.result}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: isDark ? "#0f172a" : colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: isDark ? "#94a3b8" : colors.textSecondary }]}>
          Network verileri yükleniyor...
        </Text>
      </SafeAreaView>
    );
  }

  const overdueCount = items.filter(i => i.isOverdue).length;
  const upcomingCount = items.filter(i => !i.isOverdue).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? "#1e293b" : colors.white }]}>
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? "#f8fafc" : colors.text }]}>Network</Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? "#94a3b8" : colors.textSecondary }]}>
            Takip gereken görüşmeler
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: isDark ? "#1e293b" : colors.white }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={[styles.statValue, { color: isDark ? "#f8fafc" : colors.text }]}>{overdueCount}</Text>
          <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : colors.textSecondary }]}>Gecikmiş</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? "#1e293b" : colors.white }]}>
          <Ionicons name="time-outline" size={20} color={colors.warning} />
          <Text style={[styles.statValue, { color: isDark ? "#f8fafc" : colors.text }]}>{upcomingCount}</Text>
          <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : colors.textSecondary }]}>Yaklaşan</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? "#1e293b" : colors.white }]}>
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: isDark ? "#f8fafc" : colors.text }]}>{items.length}</Text>
          <Text style={[styles.statLabel, { color: isDark ? "#94a3b8" : colors.textSecondary }]}>Toplam</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={isDark ? "#475569" : colors.textLight} />
            <Text style={[styles.emptyText, { color: isDark ? "#64748b" : colors.textSecondary }]}>
              Takip edilecek görüşme yok
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadow.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  companyText: {
    flex: 1,
  },
  companyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  contactPerson: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  cardFooter: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.sm,
  },
  overdueBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.xs,
  },
  overdueText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  resultText: {
    fontSize: fontSize.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
});

export default NetworkScreen;
