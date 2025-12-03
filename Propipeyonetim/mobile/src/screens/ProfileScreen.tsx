import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadow } from '../theme';

export default function ProfileScreen() {
  const { userProfile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle,
    onPress,
    danger = false
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    title: string;
    subtitle?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && { backgroundColor: `${colors.error}15` }]}>
        <Ionicons name={icon} size={22} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && { color: colors.error }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  const roleLabels: Record<string, string> = {
    ADMIN: 'Yönetici',
    ORTAK: 'Ortak',
    MUHASEBE: 'Muhasebe',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{userProfile?.displayName || 'Kullanıcı'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {roleLabels[userProfile?.role || ''] || 'Kullanıcı'}
            </Text>
          </View>
        </LinearGradient>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="person-outline" 
              title="Profil Bilgileri"
              subtitle="Adınız, e-posta adresiniz"
            />
            <MenuItem 
              icon="lock-closed-outline" 
              title="Güvenlik"
              subtitle="Şifre değiştir"
            />
            <MenuItem 
              icon="notifications-outline" 
              title="Bildirimler"
              subtitle="Bildirim ayarları"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="color-palette-outline" 
              title="Görünüm"
              subtitle="Tema ayarları"
            />
            <MenuItem 
              icon="language-outline" 
              title="Dil"
              subtitle="Türkçe"
            />
            <MenuItem 
              icon="information-circle-outline" 
              title="Hakkında"
              subtitle="Versiyon 1.0.0"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="log-out-outline" 
              title="Çıkış Yap"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        <Text style={styles.footerText}>
          Pro Pipe | Steel Solution © 2024
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footerText: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginVertical: spacing.xl,
  },
});
