import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getTersaneler, getProjeler, getDepartmanlar } from '../services/firebaseService';

export default function HomeScreen({ onDepartman }) {
  const { user, logout, isAdmin } = useAuth();
  const [tersaneler, setTersaneler] = useState([]);
  const [projeler, setProjeler] = useState([]);
  const [departmanlar, setDepartmanlar] = useState([]);
  const [selectedTersane, setSelectedTersane] = useState(null);
  const [selectedProje, setSelectedProje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTersaneler();
  }, []);

  const loadTersaneler = async () => {
    setLoading(true);
    setTersaneler(await getTersaneler());
    setLoading(false);
  };

  const handleTersane = async (item) => {
    setSelectedTersane(item);
    setSelectedProje(null);
    setDepartmanlar([]);
    setLoading(true);
    setProjeler(await getProjeler(item.id));
    setLoading(false);
  };

  const handleProje = async (item) => {
    setSelectedProje(item);
    setLoading(true);
    setDepartmanlar(await getDepartmanlar(item.id));
    setLoading(false);
  };

  const getData = () => {
    if (selectedProje) return departmanlar;
    if (selectedTersane) return projeler;
    return tersaneler;
  };

  const renderItem = ({ item }) => {
    if (!selectedTersane) {
      return (
        <Card color="#38bdf8" icon="business" title={item.name} subtitle="Tersane" onPress={() => handleTersane(item)} />
      );
    }
    if (!selectedProje) {
      return (
        <Card color="#22c55e" icon="folder" title={`Proje ${item.name}`} subtitle={selectedTersane.name} onPress={() => handleProje(item)} />
      );
    }
    return (
      <Card
        color={item.type === 'boru' ? '#f59e0b' : '#8b5cf6'}
        icon={item.type === 'boru' ? 'construct' : 'build'}
        title={item.name}
        subtitle={`${selectedTersane.name} · ${selectedProje.name}`}
        onPress={() => onDepartman({ departmanId: item.id, departmanType: item.type, title: `${item.tersaneName} - ${item.projeName}` })}
      />
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedProje) {
      setDepartmanlar(await getDepartmanlar(selectedProje.id));
    } else if (selectedTersane) {
      setProjeler(await getProjeler(selectedTersane.id));
    } else {
      await loadTersaneler();
    }
    setRefreshing(false);
  };

  const stats = useMemo(() => ([
    { label: 'Tersane', value: tersaneler.length },
    { label: 'Proje', value: projeler.length },
    { label: 'Departman', value: departmanlar.length },
  ]), [tersaneler.length, projeler.length, departmanlar.length]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {(selectedTersane || selectedProje) && (
            <TouchableOpacity style={styles.back} onPress={() => { setSelectedProje(null); setSelectedTersane(null); setProjeler([]); setDepartmanlar([]); }}>
              <Ionicons name="arrow-back" size={20} color="#e2e8f0" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>{selectedProje ? `Proje ${selectedProje.name}` : selectedTersane ? selectedTersane.name : 'Tersaneler'}</Text>
            <Text style={styles.subtitle}>Merhaba, {user?.name} {isAdmin ? '(Admin)' : ''}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#fca5a5" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.statCard, { borderColor: ['#38bdf8','#22c55e','#a78bfa'][i] }]}>\n            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}> 
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        <FlatList
          data={getData()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}> 
              <Ionicons name="folder-open" size={40} color="#94a3b8" />
              <Text style={styles.emptyText}>Kayıt yok</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const Card = ({ color, icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: color }]}>\n      <Ionicons name={icon} size={20} color="#0b1224" />\n    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1224' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.2)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  back: { marginRight: 12, padding: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#e2e8f0' },
  subtitle: { color: '#cbd5f5', fontSize: 12 },
  logout: { padding: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10 },
  statCard: { flex: 1, marginHorizontal: 6, backgroundColor: '#0f172a', borderRadius: 12, padding: 12, borderWidth: 1 },
  statLabel: { color: '#cbd5f5', fontSize: 12 },
  statValue: { color: '#e2e8f0', fontWeight: '700', fontSize: 18, marginTop: 4 },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cardTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 16 },
  cardSubtitle: { color: '#cbd5f5', fontSize: 12, marginTop: 2 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94a3b8', marginTop: 8 },
});
