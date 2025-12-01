import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const submit = async () => {
    try {
      await login(username, password);
    } catch (e) {
      Alert.alert('Hata', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color="#a5b4fc" />
          <Text style={styles.badgeText}>Güvenli Giriş</Text>
        </View>
        <Text style={styles.title}>Propipe Üretim Takip</Text>
        <Text style={styles.subtitle}>Tersane · Proje · Departman yönetimi</Text>

        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={20} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı"
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Panele giriş yap</Text>}
        </TouchableOpacity>

        <View style={styles.row}> 
          <Text style={styles.small}>Sanmar · Sefine</Text>
          <View style={styles.dot} />
          <Text style={styles.small}>Admin & Kullanıcı</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1224',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(148,163,184,0.1)',
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: { color: '#cbd5f5', marginLeft: 6, fontSize: 12, letterSpacing: 0.4 },
  title: { fontSize: 24, fontWeight: '800', color: '#e2e8f0' },
  subtitle: { color: '#cbd5f5', marginTop: 4, marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    marginBottom: 12,
  },
  input: { flex: 1, paddingVertical: 12, color: '#e2e8f0' },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#0f172a', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  small: { color: '#cbd5f5', fontSize: 12 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: '#38bdf8', marginHorizontal: 6 },
});
