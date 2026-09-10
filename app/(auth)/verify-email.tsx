import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API = "https://vocalink-fastapi.onrender.com/api/auth";

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert("Enter code", "Please enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed.");
      Alert.alert("✅ Verified!", "Your email is verified. You can now sign in.", [
        { text: "Sign In", onPress: () => router.replace("/(auth)/login" as any) },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={["#1AADDC", "#0E8DB8"]} style={styles.header}>
            <Text style={styles.icon}>📧</Text>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.sub}>
              We sent a 6-digit code to{"\n"}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </LinearGradient>

          <View style={styles.form}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={t => setCode(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="0 0 0 0 0 0"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={styles.hint}>The code expires in 30 minutes.</Text>
            <Text style={[styles.hint, { marginTop: 4 }]}>💡 Check your email inbox or spam folder.</Text>

            <TouchableOpacity
              style={[styles.btn, (loading || code.length < 6) && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={loading || code.length < 6}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Verify Email</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                setResending(true);
                try {
                  await fetch(`${API}/resend-verification/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  Alert.alert("Code Resent", "A new code has been sent. Check your email or Render logs.");
                } catch {
                  Alert.alert("Error", "Could not resend code. Try again.");
                } finally {
                  setResending(false);
                }
              }}
              disabled={resending}
              style={{ marginTop: 16, alignItems: "center" }}
            >
              <Text style={styles.back}>{resending ? "Resending..." : "↻ Resend Code"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login" as any)}
              style={{ marginTop: 8, alignItems: "center" }}
            >
              <Text style={[styles.back, { color: "#94A3B8" }]}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: "#F0F4F8" },
  scroll:     { flexGrow: 1 },
  header: {
    padding: 40, paddingTop: 60, alignItems: "center",
  },
  icon:       { fontSize: 56, marginBottom: 16 },
  title:      { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  sub:        { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 10, textAlign: "center", lineHeight: 22 },
  email:      { fontWeight: "700", color: "#fff" },
  form: {
    flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 28, paddingTop: 32, marginTop: -20,
  },
  label:      { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10 },
  codeInput: {
    backgroundColor: "#F3F4F6", borderWidth: 2, borderColor: "#1AADDC",
    borderRadius: 14, padding: 18, fontSize: 28, fontWeight: "800",
    color: "#0F172A", textAlign: "center", letterSpacing: 12, marginBottom: 8,
  },
  hint:       { fontSize: 12, color: "#9CA3AF", textAlign: "center", marginBottom: 24 },
  btn: {
    backgroundColor: "#1AADDC", padding: 18, borderRadius: 14,
    alignItems: "center", minHeight: 56, justifyContent: "center",
  },
  btnDisabled:{ backgroundColor: "#9CA3AF" },
  btnText:    { color: "#fff", fontSize: 16, fontWeight: "800" },
  back:       { color: "#1AADDC", fontSize: 14, fontWeight: "600" },
});
