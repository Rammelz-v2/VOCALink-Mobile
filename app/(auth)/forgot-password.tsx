import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView,
  Platform, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { forgotPasswordStyles as styles } from "../../styles/forgotPasswordStyles";

const API = "https://vocalink-fastapi-7gxl.onrender.com/api/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not send reset code. Please try again.");
      router.push({ pathname: "/(auth)/reset-password" as any, params: { email: trimmed } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Reset Password</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formPanel}
      >
        <View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a 6-digit reset code.
          </Text>

          <Text style={s.label}>Email Address</Text>
          <TextInput
            style={[s.input, error ? { borderColor: "#EF4444" } : null]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
            style={{ marginTop: 22, opacity: loading ? 0.65 : 1 }}
          >
            <LinearGradient
              colors={["#2DD4E6", "#14B8B0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.button}
            >
              {loading
                ? <ActivityIndicator color="#ffffff" />
                : <Text style={s.buttonText}>Send Reset Code</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: "center", marginTop: 14 }}
            onPress={() => router.push("/(auth)/login" as any)}
          >
            <Text style={s.backLink}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  label:      { fontSize: 13, fontWeight: "600", color: "#0F172A", marginBottom: 6, marginTop: 14 },
  input:      { backgroundColor: "#EEF2F8", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 9, padding: 12, paddingHorizontal: 14, fontSize: 14, color: "#0F172A", marginBottom: 4 },
  errorText:  { color: "#EF4444", fontSize: 12, marginBottom: 8 },
  button:     { padding: 13, borderRadius: 9, alignItems: "center", shadowColor: "rgba(45,212,230,0.4)", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 6 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  backLink:   { color: "#1AADDC", fontSize: 14, fontWeight: "600" },
});
