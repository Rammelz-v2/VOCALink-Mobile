import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { forgotPasswordStyles as styles } from "../../styles/forgotPasswordStyles";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Reset Password</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* White Form Panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formPanel}
      >
        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successText}>
              Check your inbox for instructions to reset your password.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login" as any)}
              activeOpacity={0.85}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={["#2DD4E6", "#14B8B0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={fallbackStyles.button}
              >
                <Text style={fallbackStyles.buttonText}>Back to Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a reset link.
            </Text>
            
            <Text style={fallbackStyles.label}>Email Address</Text>
            <TextInput 
              style={[fallbackStyles.input, error ? { borderColor: 'red' } : null]} 
              value={email} 
              onChangeText={setEmail} 
              placeholder="Enter your email" 
              autoCapitalize="none"
              keyboardType="email-address" 
            />
            {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
              style={{ marginTop: 22, opacity: loading ? 0.65 : 1 }}
            >
              <LinearGradient
                colors={["#2DD4E6", "#14B8B0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={fallbackStyles.button}
              >
                {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={fallbackStyles.buttonText}>Send Reset Link</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: "center", marginTop: 14 }}
              onPress={() => router.push("/(auth)/login" as any)}
            >
              <Text style={{ color: "#1AADDC", fontSize: 14, fontWeight: "600" }}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const fallbackStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#EEF2F8', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 9, padding: 12, paddingHorizontal: 14, fontSize: 14, color: '#0F172A', marginBottom: 4 },
  button: { padding: 13, borderRadius: 9, alignItems: 'center' as const, shadowColor: 'rgba(45,212,230,0.4)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 6 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});