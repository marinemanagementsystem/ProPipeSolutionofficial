import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../context/AuthContext";

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError("E-posta ve şifre gerekli");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Giriş yapılamadı, bilgileri kontrol edin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#111827", theme.colors.primary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.logoArea}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="headlineLarge" style={styles.title}>
              PRO PIPE | STEEL
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Operasyon yönetimi için mobil asistan
            </Text>
          </View>

          <View style={styles.card}>
            <TextInput
              label="E-posta"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Şifre"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
            />
            {error && <HelperText type="error">{error}</HelperText>}
            <Button
              mode="contained"
              onPress={onSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.button}
              contentStyle={{ paddingVertical: 8 }}
            >
              Giriş Yap
            </Button>
            <Text style={styles.helperText}>
              Giriş bilgileriniz web uygulamasındaki ile aynıdır.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoArea: {
    alignItems: "center",
    gap: 8,
    paddingTop: 32,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 20,
  },
  title: {
    color: "#f8fafc",
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#cbd5e1",
  },
  card: {
    marginTop: "auto",
    marginBottom: 32,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.8)",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.08)",
  },
  input: {
    backgroundColor: "transparent",
  },
  button: {
    borderRadius: 12,
    marginTop: 4,
  },
  helperText: {
    color: "#cbd5e1",
    textAlign: "center",
  },
});

export default LoginScreen;
