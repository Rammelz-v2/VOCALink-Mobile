import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCrossAlert } from "../../components/CrossAlert";

const API = "https://vocalink-fastapi-7gxl.onrender.com/api/auth";
const RESEND_COOLDOWN = 60;

export default function ResetPasswordScreen() {
  const showAlert = useCrossAlert();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode]             = useState("");
  const [newPass, setNewPass]       = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [resending, setResending]   = useState(false);
  const [error, setError]           = useState("");
  const [cooldown, setCooldown]     = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleReset = async () => {
    if (code.length < 6) { setError("Please enter the 6-digit code."); return; }
    if (newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed. Try again.");
      showAlert({
        title: "Password Reset!",
        message: "Your password has been updated. You can now sign in.",
        buttons: [{ text: "Sign In", onPress: () => router.replace("/(auth)/login" as any) }],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${API}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Could not resend. Try again.");
      setCooldown(RESEND_COOLDOWN);
      showAlert({ title: "Code Resent", message: "A new 6-digit code has been sent to your email." });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

          <LinearGradient
            colors={["#070F1E", "#0B1526", "#12213A"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.header}
          >
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={s.icon}>🔑</Text>
            <Text style={s.title}>Reset Password</Text>
            <Text style={s.sub}>
              Enter the code we sent to{"\n"}
              <Text style={s.emailText}>{email}</Text>
            </Text>
          </LinearGradient>

          <View style={s.form}>
            {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

            <Text style={s.label}>Reset Code</Text>
            <TextInput
              style={s.codeInput}
              value={code}
              onChangeText={t => setCode(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="0 0 0 0 0 0"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={s.hint}>Code expires in 30 minutes. Check spam if not received.</Text>

            <Text style={[s.label, { marginTop: 16 }]}>New Password</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.inputInner}
                value={newPass}
                onChangeText={setNewPass}
                placeholder="At least 6 characters"
                secureTextEntry={!showPass}
                autoComplete="new-password"
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn} activeOpacity={0.7}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading || code.length < 6}
              activeOpacity={0.85}
              style={{ marginTop: 24, opacity: loading ? 0.65 : 1 }}
            >
              <LinearGradient
                colors={["#2DD4E6", "#14B8B0"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.button}
              >
                {loading
                  ? <ActivityIndicator color="#ffffff" />
                  : <Text style={s.buttonText}>Reset Password</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.resendRow}>
              {cooldown > 0 ? (
                <Text style={s.cooldownText}>Resend available in {cooldown}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
                  <Text style={s.resendLink}>{resending ? "Sending…" : "↻ Resend Code"}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={{ alignItems: "center", marginTop: 8 }}
              onPress={() => router.replace("/(auth)/login" as any)}
            >
              <Text style={[s.resendLink, { color: "#94A3B8" }]}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: "#F0F5F9" },
  header:     { padding: 40, paddingTop: 56, alignItems: "center" },
  backBtn:    { position: "absolute", top: 56, left: 20 },
  icon:       { fontSize: 52, marginBottom: 14 },
  title:      { fontSize: 26, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  sub:        { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 10, textAlign: "center", lineHeight: 22 },
  emailText:  { fontWeight: "700", color: "#fff" },
  form: {
    flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 28, paddingTop: 32, marginTop: -20,
  },
  errorBox:   { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 9, padding: 12, marginBottom: 14 },
  errorText:  { color: "#B91C1C", fontSize: 13, fontWeight: "600" },
  label:      { fontSize: 13, fontWeight: "600", color: "#0F172A", marginBottom: 8 },
  codeInput:  { backgroundColor: "#EEF2F8", borderWidth: 2, borderColor: "#1AADDC", borderRadius: 14, padding: 18, fontSize: 28, fontWeight: "800", color: "#0F172A", textAlign: "center", letterSpacing: 12, marginBottom: 6 },
  hint:       { fontSize: 11, color: "#9CA3AF", textAlign: "center", marginBottom: 4 },
  inputWrap:  { flexDirection: "row", alignItems: "center", backgroundColor: "#EEF2F8", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 9 },
  inputInner: { flex: 1, padding: 12, paddingHorizontal: 14, fontSize: 14, color: "#0F172A" },
  eyeBtn:     { paddingHorizontal: 12, paddingVertical: 10 },
  button:     { padding: 13, borderRadius: 9, alignItems: "center", elevation: 6 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  resendRow:  { alignItems: "center", marginTop: 16 },
  resendLink: { color: "#1AADDC", fontSize: 14, fontWeight: "600" },
  cooldownText: { fontSize: 13, color: "#94A3B8" },
});
