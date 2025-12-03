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
      setError("E-posta ve sifre gerekli");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Giris yapilamadi, bilgileri kontrol edin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0b1226", "#0f172a", "#0b63b4"]}
      style={styles.flex}
    >
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <View style={styles.hero}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="labelLarge" style={styles.kicker}>
              PRO PIPE | STEEL
            </Text>
            <Text variant="headlineMedium" style={styles.title}>
              Mobil kontrol paneli
            </Text>
            <Text style={styles.subtitle}>
              Operasyon, gider ve network durumunu tek yerden takip edin.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Oturum ac
            </Text>
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
              label="Sifre"
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
              contentStyle={{ paddingVertical: 10 }}
            >
              Giris Yap
            </Button>
            <Text style={styles.helperText}>
              Giris bilgileriniz web paneli ile aynidir.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    alignItems: "center",
    gap: 8,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
  },
  kicker: {
    color: "#cbd5e1",
    letterSpacing: 1.2,
  },
  title: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 4,
  },
  card: {
    marginTop: "auto",
    marginBottom: 32,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 18,
    gap: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  cardTitle: {
    fontWeight: "700",
  },
  input: {
    backgroundColor: "transparent",
  },
  button: {
    borderRadius: 12,
    marginTop: 4,
  },
  helperText: {
    color: "#748096",
    textAlign: "center",
  },
});

export default LoginScreen;
