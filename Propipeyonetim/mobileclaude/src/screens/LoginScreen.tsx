import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Input, Button } from "../components";
import { SIZES, COLORS } from "../theme";

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "E-posta adresi gerekli";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
    }

    if (!password) {
      newErrors.password = "Şifre gerekli";
    } else if (password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalı";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      let message = "Giriş başarısız";
      if (error.code === "auth/user-not-found") {
        message = "Kullanıcı bulunamadı";
      } else if (error.code === "auth/wrong-password") {
        message = "Yanlış şifre";
      } else if (error.code === "auth/invalid-email") {
        message = "Geçersiz e-posta adresi";
      } else if (error.code === "auth/too-many-requests") {
        message = "Çok fazla deneme. Lütfen daha sonra tekrar deneyin";
      }
      Alert.alert("Hata", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark, "#0a4a5c"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.title}>Propipe Yönetim</Text>
            <Text style={styles.subtitle}>Yönetim paneline giriş yapın</Text>
          </View>

          {/* Form */}
          <View
            style={[
              styles.formContainer,
              { backgroundColor: theme.colors.surface }
            ]}
          >
            <Input
              label="E-posta"
              placeholder="ornek@propipe.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <Button
              title={loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              fullWidth
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Propipe Solution © {new Date().getFullYear()}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
    justifyContent: "center"
  },
  header: {
    alignItems: "center",
    marginBottom: SIZES.xl
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.md
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff"
  },
  title: {
    fontSize: SIZES.font4xl,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: SIZES.xs
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: "rgba(255,255,255,0.8)"
  },
  formContainer: {
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  loginButton: {
    marginTop: SIZES.sm
  },
  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    marginTop: SIZES.xl,
    fontSize: SIZES.fontSm
  }
});
