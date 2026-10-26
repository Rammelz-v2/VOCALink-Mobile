import React, { useState, useEffect } from "react";
import {
  ScrollView, StyleSheet, Text, TouchableOpacity,
  View, Alert, ActivityIndicator, Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import { Badge } from "../ui/shared";

interface Props {
  setActive: (tab: any) => void;
}

export default function TeacherHome({ setActive }: Props) {
  const { user, token } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionCode, setSessionCode]         = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [checking, setChecking]               = useState(true); // true while we verify session state on mount

  const displayName = user?.first_name || user?.username || "Teacher";

  // ── On mount: restore session state from the DB ──────────────────────────
  // Without this, navigating away would reset the button to "Start Class"
  // even if a session was still running on the server.
  useEffect(() => {
    if (!token) { setChecking(false); return; }
    axios
      .get(`${API_BASE_URL}/sessions/teacher`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setIsSessionActive(res.data.active);
        setSessionCode(res.data.session_code ?? null);
      })
      .catch(() => {
        setIsSessionActive(false);
        setSessionCode(null);
      })
      .finally(() => setChecking(false));
  }, [token]);

  // ── Toggle session (start / end) ─────────────────────────────────────────
  const executeToggle = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/sessions/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSessionActive(res.data.active);
      setSessionCode(res.data.session_code ?? null);

      // If class just started, jump straight into the live room
      if (res.data.active) setActive("teacher-livecc");
    } catch {
      Alert.alert("Error", "Could not toggle session. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isSessionActive) {
      Alert.alert("Session in Progress", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        { text: "End Class",       style: "destructive", onPress: executeToggle },
        { text: "Go to Live Room", onPress: () => setActive("teacher-livecc") },
      ]);
    } else {
      executeToggle();
    }
  };

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.teal} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={[s.hero, { backgroundColor: isSessionActive ? "#064E3B" : "#2D226A" }]}>
          <View style={s.heroAccent} />
          <Badge color={isSessionActive ? "green" : "gray"} style={{ marginBottom: 10 }}>
            {isSessionActive ? "Class in Session" : "Offline"}
          </Badge>
          <Text style={s.heroGreeting}>Welcome back,</Text>
          <Text style={s.heroName}>Teacher {displayName} 🍎</Text>
          <Text style={s.heroSub}>
            {isSessionActive
              ? "Share the code below with your students"
              : "Start a session to connect with your students."}
          </Text>
        </View>

        {/* ── Session code card ── */}
        {isSessionActive && sessionCode && (
          <Animated.View entering={FadeInDown.duration(350).springify()} style={s.codeCard}>
            <View style={s.codeCardTop}>
              <View>
                <Text style={s.codeCardLabel}>SESSION CODE</Text>
                <Text style={s.codeCardHint}>Students enter this to join your class</Text>
              </View>
              <TouchableOpacity
                style={s.shareBtn}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Share.share({
                    message: `Join my VOCALink class!\n\nSession Code: ${sessionCode}\n\nOpen the VOCALink app and enter this code to connect.`,
                  });
                }}
              >
                <Text style={s.shareBtnText}>Share  ↗</Text>
              </TouchableOpacity>
            </View>
            <View style={s.codeBoxRow}>
              {sessionCode.split("").map((char, i) => (
                <View key={i} style={s.codeBox}>
                  <Text style={s.codeBoxChar}>{char}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── Big start / return button ── */}
        <View style={s.section}>
          <TouchableOpacity
            style={[s.startBtn, isSessionActive && s.startBtnActive]}
            onPress={handleToggle}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
              : <Text style={s.startBtnEmoji}>{isSessionActive ? "🟢" : "🎙️"}</Text>
            }
            <View style={{ flex: 1 }}>
              <Text style={s.startBtnLabel}>
                {isSessionActive ? "Return to Live Room" : "Start Class Session"}
              </Text>
              <Text style={s.startBtnSub}>
                {isSessionActive
                  ? "Your class is currently running"
                  : "Open room for live captions & messaging"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Classroom tools grid ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Classroom Tools</Text>
          <View style={s.actionGrid}>

            <TouchableOpacity
              style={[s.toolCard, !isSessionActive && s.toolCardDisabled]}
              disabled={!isSessionActive}
              onPress={() => setActive("teacher-livecc")}
            >
              <View style={[s.toolIconWrap, { backgroundColor: C.tealLight }]}>
                <Text style={s.toolIcon}>📝</Text>
              </View>
              <Text style={[s.toolLabel, !isSessionActive && s.toolLabelMuted]}>Live CC</Text>
              <Text style={s.toolSub}>Broadcast speech</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.toolCard}>
              <View style={[s.toolIconWrap, { backgroundColor: C.purpleLight }]}>
                <Text style={s.toolIcon}>👥</Text>
              </View>
              <Text style={s.toolLabel}>Students</Text>
              <Text style={s.toolSub}>Manage roster</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.toolCard}>
              <View style={[s.toolIconWrap, { backgroundColor: "#FECACA" }]}>
                <Text style={s.toolIcon}>📊</Text>
              </View>
              <Text style={s.toolLabel}>Analytics</Text>
              <Text style={s.toolSub}>AAC logs</Text>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.bg },
  scroll:          { paddingBottom: 40 },
  hero:            { padding: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, overflow: "hidden" },
  heroAccent:      { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: "#7C5CFC" },
  heroGreeting:    { fontSize: FontSize.base, color: "rgba(255,255,255,0.8)", fontWeight: "500", marginTop: 4 },
  heroName:        { fontSize: FontSize.xxl, color: "#FFF", fontWeight: "800", letterSpacing: -1, marginTop: 4 },
  heroSub:         { fontSize: FontSize.sm, color: "rgba(255,255,255,0.9)", marginTop: 8, fontWeight: "600" },
  section:         { padding: Spacing.lg, gap: 14 },
  sectionTitle:    { fontSize: FontSize.lg, fontWeight: "800", color: C.text, letterSpacing: -0.5, borderLeftWidth: 3, borderLeftColor: "#7C5CFC", paddingLeft: 10 },
  startBtn:        { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: C.teal, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md },
  startBtnActive:  { backgroundColor: "#047857" },
  startBtnEmoji:   { fontSize: 32 },
  startBtnLabel:   { fontSize: FontSize.lg, fontWeight: "800", color: C.white },
  startBtnSub:     { fontSize: FontSize.xs, color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: "500" },
  codeCard:        { marginHorizontal: Spacing.lg, marginTop: -16, backgroundColor: "#FFF", borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.lg, borderWidth: 1, borderColor: "rgba(124,92,252,0.18)" },
  codeCardTop:     { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: Spacing.md },
  codeCardLabel:   { fontSize: FontSize.xs, fontWeight: "800", color: "#7C5CFC", letterSpacing: 1.5 },
  codeCardHint:    { fontSize: FontSize.xs, color: C.text3, marginTop: 3, fontWeight: "500" },
  shareBtn:        { backgroundColor: "#7C5CFC", borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  shareBtnText:    { fontSize: FontSize.sm, fontWeight: "700", color: "#FFF" },
  codeBoxRow:      { flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 4 },
  codeBox:         { flex: 1, aspectRatio: 1, maxWidth: 48, backgroundColor: "#F4F2FF", borderRadius: Radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(124,92,252,0.3)" },
  codeBoxChar:     { fontSize: 22, fontWeight: "900", color: "#2D226A", letterSpacing: 0 },
  actionGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  toolCard:        { width: "48%", backgroundColor: C.white, borderRadius: Radius.lg, padding: Spacing.md, alignItems: "flex-start", borderWidth: 1, borderColor: C.gray2, ...Shadow.sm },
  toolCardDisabled:{ opacity: 0.45 },
  toolIconWrap:    { width: 40, height: 40, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  toolIcon:        { fontSize: 20 },
  toolLabel:       { fontSize: FontSize.md, fontWeight: "700", color: C.text },
  toolLabelMuted:  { color: C.text3 },
  toolSub:         { fontSize: FontSize.xs, color: C.text3, marginTop: 4 },
});