import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Button, Chip } from '../components';

const ProfileScreen: React.FC = () => {
  const { currentUserProfile, logout } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* User Info Card */}
        <Card style={styles.userCard} variant="elevated">
          <View style={[styles.avatarContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {currentUserProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {currentUserProfile?.displayName || 'Kullanıcı'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {currentUserProfile?.email}
          </Text>
          <Chip
            label={currentUserProfile?.role || 'Kullanıcı'}
            variant="primary"
            style={{ marginTop: 12 }}
          />
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard} variant="outlined">
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ayarlar</Text>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={22} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Tema</Text>
            </View>
            <Button
              title={mode === 'dark' ? 'Koyu' : 'Açık'}
              onPress={toggleTheme}
              variant="outline"
              size="small"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Versiyon</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard} variant="outlined">
          <View style={[styles.logoContainer, { backgroundColor: `${colors.primary}10` }]}>
            <Ionicons name="business" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>ProPipe Yönetim</Text>
          <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
            Pro Pipe Steel Solution - Şirket yönetim ve takip sistemi
          </Text>
          <Text style={[styles.copyright, { color: colors.textTertiary }]}>
            © 2025 Pro Pipe Steel Solution
          </Text>
        </Card>

        {/* Logout Button */}
        <Button
          title="Çıkış Yap"
          onPress={handleLogout}
          variant="danger"
          size="large"
          icon={<Ionicons name="log-out-outline" size={20} color="#fff" />}
          style={{ marginTop: 24, marginBottom: 32 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingValue: {
    fontSize: 14,
  },
  infoCard: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
  },
  appDescription: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  copyright: {
    fontSize: 11,
    marginTop: 12,
  },
});

export default ProfileScreen;
