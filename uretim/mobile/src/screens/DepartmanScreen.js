import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTechizIsler, getBoruIsler, updateTechizIs, updateBoruIs, getUstalar } from '../services/firebaseService';

const statusMap = {
  BASLANMADI: { label: 'Başlanmadı', color: '#f87171' },
  DEVAM_EDIYOR: { label: 'Devam', color: '#facc15' },
  FINAL_ASAMASINDA: { label: 'Final', color: '#f472b6' },
  TERSANEDEN_BEKLENIYOR: { label: 'Bekleniyor', color: '#38bdf8' },
  TAMAMLANDI: { label: 'Tamam', color: '#22c55e' },
  NA: { label: 'N/A', color: '#94a3b8' },
};

export default function DepartmanScreen({ route, goHome }) {
  const { departmanId, departmanType, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [ustalar, setUstalar] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    load();
  }, [departmanId]);

  const load = async () => {
    setLoading(true);
    setUstalar(await getUstalar());
    if (departmanType === 'boru') {
      setItems(await getBoruIsler(departmanId));
    } else {
      setItems(await getTechizIsler(departmanId));
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSave = async () => {
    try {
      if (departmanType === 'boru') {
        await updateBoruIs(selected.id, selected);
      } else {
        await updateTechizIs(selected.id, selected);
      }
      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert('Hata', 'Güncellenemedi');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.back} onPress={goHome}>
            <Ionicons name="arrow-back" size={20} color="#e2e8f0" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{departmanType === 'boru' ? 'Boru / Spool' : 'Teçhiz'}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderColor: statusMap[item.uretimDurumu || 'NA']?.color || '#38bdf8' }]}
            onPress={() => { setSelected(item); setModalVisible(true); }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.tanim || item.system}</Text>
              <Text style={styles.cardSubtitle}>{item.mahal || item.pipe} {item.spoolNo ? `· Spool ${item.spoolNo}` : ''}</Text>
              {item.ustaIsmi || item.montajYapanUsta ? <Text style={styles.small}>Usta: {item.ustaIsmi || item.montajYapanUsta}</Text> : null}
            </View>
            {departmanType === 'boru' ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.badge, { backgroundColor: item.imalat ? '#facc15' : '#1f2937' }]}>İmalat {item.imalat}</Text>
                <Text style={[styles.badge, { backgroundColor: item.montaj ? '#22c55e' : '#1f2937', marginTop: 4 }]}>Montaj {item.montaj}</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.badge, { backgroundColor: statusMap[item.uretimDurumu]?.color || '#334155' }]}>{statusMap[item.uretimDurumu]?.label}</Text>
                <Text style={[styles.badge, { backgroundColor: statusMap[item.montajDurumu]?.color || '#334155', marginTop: 4 }]}>{statusMap[item.montajDurumu]?.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>Kayıt yok</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Düzenle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#cbd5f5" />
              </TouchableOpacity>
            </View>
            {selected && (
              <View style={{ padding: 16 }}>
                {departmanType === 'boru' ? (
                  <>
                    <Text style={styles.label}>İmalat</Text>
                    <PickerField value={selected.imalat} onChange={(v) => setSelected({ ...selected, imalat: v })} />
                    <Text style={styles.label}>Montaj</Text>
                    <PickerField value={selected.montaj} onChange={(v) => setSelected({ ...selected, montaj: v })} />
                    <Text style={styles.label}>Montaj Usta</Text>
                    <UstaField value={selected.montajYapanUsta} onChange={(v) => setSelected({ ...selected, montajYapanUsta: v })} ustalar={ustalar} />
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>Üretim</Text>
                    <StatusField value={selected.uretimDurumu} onChange={(v) => setSelected({ ...selected, uretimDurumu: v })} />
                    <Text style={styles.label}>Montaj</Text>
                    <StatusField value={selected.montajDurumu} onChange={(v) => setSelected({ ...selected, montajDurumu: v })} />
                    <Text style={styles.label}>Kaynak</Text>
                    <StatusField value={selected.kaynakDurumu} onChange={(v) => setSelected({ ...selected, kaynakDurumu: v })} />
                    <Text style={styles.label}>Usta</Text>
                    <UstaField value={selected.ustaIsmi} onChange={(v) => setSelected({ ...selected, ustaIsmi: v })} ustalar={ustalar} />
                    <Text style={styles.label}>Açıklama</Text>
                    <TextInput style={styles.input} value={selected.aciklama || ''} onChangeText={(t) => setSelected({ ...selected, aciklama: t })} />
                  </>
                )}
                <TouchableOpacity style={styles.save} onPress={handleSave}><Text style={styles.saveText}>Kaydet</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PickerField = ({ value, onChange }) => (
  <View style={styles.input}> 
    <TouchableOpacity onPress={() => onChange(value === 1 ? 0 : 1)}>
      <Text style={{ color: '#e2e8f0' }}>{value}</Text>
    </TouchableOpacity>
  </View>
);

const StatusField = ({ value, onChange }) => (
  <View style={styles.input}> 
    <TouchableOpacity onPress={() => {
      const keys = Object.keys(statusMap);
      const idx = keys.indexOf(value);
      onChange(keys[(idx + 1) % keys.length]);
    }}>
      <Text style={{ color: '#e2e8f0' }}>{statusMap[value]?.label}</Text>
    </TouchableOpacity>
  </View>
);

const UstaField = ({ value, onChange, ustalar }) => (
  <View style={styles.input}> 
    <TouchableOpacity onPress={() => {
      const names = ustalar.map((u) => u.name);
      const idx = names.indexOf(value);
      const next = names[(idx + 1) % names.length] || names[0] || '';
      onChange(next);
    }}>
      <Text style={{ color: '#e2e8f0' }}>{value || 'Seçiniz'}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1224' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.2)' },
  back: { marginRight: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#e2e8f0' },
  subtitle: { color: '#cbd5f5', fontSize: 12 },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 14, backgroundColor: '#0f172a', marginBottom: 12 },
  cardTitle: { color: '#e2e8f0', fontWeight: '700' },
  cardSubtitle: { color: '#cbd5f5', marginTop: 4, fontSize: 12 },
  small: { color: '#94a3b8', marginTop: 4, fontSize: 12 },
  badge: { color: '#0b1224', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, fontWeight: '700', overflow: 'hidden' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b1224' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.2)' },
  modalTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 16 },
  label: { color: '#cbd5f5', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#111827', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  save: { marginTop: 16, backgroundColor: '#38bdf8', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#0f172a', fontWeight: '700' },
});
