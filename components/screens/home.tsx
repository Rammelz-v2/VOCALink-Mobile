import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { QUICK_ICONS } from "../../constants/mockdata";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import type { TabName } from "../ui/BottomNav";
import { Badge, IconPill } from "../ui/shared";
import { ScreenHeader } from "../ui/ScreenHeader";

import TeacherHome from "./teacher-home"; 

interface HomeProps {
  setActive: (tab: TabName) => void;
  sessionCode?: string | null;
}

const CTAButton: React.FC<{ emoji: string; label: string; sub: string; color: string; onPress: () => void; }> = ({ emoji, label, sub, color, onPress }) => (
  <TouchableOpacity
    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
    activeOpacity={0.85}
    style={[styles.ctaCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
  >
    <Text style={styles.ctaEmoji}>{emoji}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.ctaLabel}>{label}</Text>
      <Text style={styles.ctaSub}>{sub}</Text>
    </View>
    <Text style={[styles.ctaArrow, { color }]}>›</Text>
  </TouchableOpacity>
);

const Home: React.FC<HomeProps> = ({ setActive, sessionCode: sessionCodeProp }) => {
  const { user, token } = useAuth();
  const [activeSessionCode, setActiveSessionCode] = useState<string | null>(null);

  // 💥 FIX: Moved the useEffect ABOVE the early return statement so React doesn't crash!
  useEffect(() => {
    // If they aren't a student, don't run the polling logic inside
    if (!token || user?.status !== "STUDENT") return;

    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sessions/student`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.active) {
          setActiveSessionCode(res.data.session_code);
        } else {
          setActiveSessionCode(null);
        }
      } catch (e) {
        console.log("Could not check session");
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 5000); 
    return () => clearInterval(interval);
  }, [token, user]);

  // 💥 THE HIJACK: Now it is safely below all hooks!
  if (user?.status === "TEACHER") {
    return <TeacherHome setActive={setActive} />;
  }

  // --- EVERYTHING BELOW THIS LINE ONLY RUNS FOR STUDENTS ---

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const rawUsername = user?.username ?? "";
  const usernameIsEmail = rawUsername.includes("@");
  // Priority: first_name → username (if not email) → first part of email → "Student"
  const displayName =
    user?.first_name ||
    (!usernameIsEmail ? rawUsername : rawUsername.split("@")[0]) ||
    "Student";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <ScreenHeader
          title={`${greeting}, ${displayName} 👋`}
          subtitle="VocaLink — Your voice matters"
          right={<Badge color="teal">Online</Badge>}
        />

        {/* ACTIVE SESSION BANNER */}
        {activeSessionCode && (
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setActive("livecc"); 
            }}
            style={styles.activeClassBanner}
          >
            <View style={styles.activeClassTop}>
              <Text style={styles.activeClassIcon}>🚨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeClassTitle}>Class is Live!</Text>
                <Text style={styles.activeClassSub}>Your teacher has started a session.</Text>
              </View>
            </View>
            <View style={styles.activeClassBtn}>
              <Text style={styles.activeClassBtnText}>Join Live CC Room</Text>
            </View>
          </TouchableOpacity>
        )}


        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Quick Express</Text>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setActive("board"); }} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_ICONS.map(icon => (
              <IconPill key={icon.id} emoji={icon.emoji} label={icon.label} bg={icon.bg} size="lg" onPress={() => setActive("board")} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Go to</Text>
          <View style={styles.ctaList}>
            <CTAButton emoji="🗣" label="Full AAC Board" sub="Tap icons to communicate" color={C.purple} onPress={() => setActive("board")} />
            <CTAButton emoji="📝" label="Live Captions" sub="See what teacher is saying" color="#22C55E" onPress={() => setActive("livecc")} />
          </View>
        </View>

        <View style={[styles.section, styles.infoCard]}>
          <Text style={styles.infoTitle}>My Info</Text>
          {[
            { icon: "👤", lbl: "Name", val: displayName },
            { icon: "🏷", lbl: "Username", val: user?.username ?? "—" },
            { icon: "📚", lbl: "Grade", val: user?.grade_level ?? "—" },
          ].map((r, i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoIcon}>{r.icon}</Text>
              <Text style={styles.infoLbl}>{r.lbl}</Text>
              <Text style={styles.infoVal}>{r.val}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 40 },
  hero: { padding: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl },
  heroGreeting: { fontSize: FontSize.base, color: "rgba(255,255,255,0.6)", fontWeight: "500", marginTop: 4 },
  heroName: { fontSize: FontSize.xxl, color: "#FFFFFF", fontWeight: "800", letterSpacing: -1, marginTop: 4 },
  heroSub: { fontSize: FontSize.sm, color: "rgba(255,255,255,0.5)", marginTop: 8, fontWeight: "500" },
  activeClassBanner: { margin: Spacing.lg, padding: Spacing.lg, backgroundColor: "#10B981", borderRadius: Radius.lg, ...Shadow.md },
  activeClassTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  activeClassIcon: { fontSize: 28 },
  activeClassTitle: { fontSize: FontSize.lg, fontWeight: "800", color: C.white },
  activeClassSub: { fontSize: FontSize.sm, color: "rgba(255,255,255,0.9)", fontWeight: "500", marginTop: 2 },
  activeClassBtn: { backgroundColor: C.white, paddingVertical: 12, borderRadius: Radius.md, alignItems: "center" },
  activeClassBtnText: { color: "#047857", fontWeight: "800", fontSize: FontSize.base },
  section: { padding: Spacing.lg, gap: 14 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  seeAllBtn: { backgroundColor: C.purpleLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  seeAllText: { fontSize: FontSize.sm, color: C.purple, fontWeight: "700" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "space-around", backgroundColor: C.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: C.gray2, ...Shadow.sm },
  ctaList: { gap: 10 },
  ctaCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: C.gray2, minHeight: 72, ...Shadow.sm },
  ctaEmoji: { fontSize: 28 },
  ctaLabel: { fontSize: FontSize.md, fontWeight: "700", color: C.text },
  ctaSub: { fontSize: FontSize.xs, color: C.text3, marginTop: 2, fontWeight: "500" },
  ctaArrow: { fontSize: 28, fontWeight: "300" },
  infoCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: C.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: C.gray2, ...Shadow.sm },
  infoTitle: { fontSize: FontSize.md, fontWeight: "700", color: C.text, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.gray },
  infoIcon: { fontSize: 20 },
  infoLbl: { fontSize: FontSize.sm, color: C.text3, flex: 1, fontWeight: "500" },
  infoVal: { fontSize: FontSize.sm, color: C.text, fontWeight: "700" },
});

export default Home;