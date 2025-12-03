import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input, Button } from '../components';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const { colors, mode } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error: any) {
      let message = 'Giriş yapılırken bir hata oluştu.';
      if (error.code === 'auth/user-not-found') {
        message = 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Şifre hatalı.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Geçersiz e-posta adresi.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
      }
      Alert.alert('Giriş Hatası', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Ionicons name="business" size={40} color="#0f172a" />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTextPro}>PRO </Text>
              <Text style={styles.logoTextPipe}>PIPE</Text>
              <Text style={[styles.logoSeparator, { color: colors.textTertiary }]}> | </Text>
              <Text style={styles.logoTextSteel}>STEEL</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>SOLUTION</Text>
            <Text style={[styles.appName, { color: colors.textSecondary }]}>
              Yönetim Paneli
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Input
              label="E-posta"
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />}
              rightIcon={
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              title="Giriş Yap"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              size="large"
              style={{ marginTop: 16 }}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              © 2025 Pro Pipe Steel Solution
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTextPro: {
    fontSize: 24,
    fontWeight: '300',
    color: '#22d3ee',
  },
  logoTextPipe: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22d3ee',
  },
  logoSeparator: {
    fontSize: 24,
    fontWeight: '300',
    marginHorizontal: 4,
  },
  logoTextSteel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#a78bfa',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  appName: {
    fontSize: 14,
    marginTop: 8,
  },
  formSection: {
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default LoginScreen;
