import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import type { TabName } from "../ui/BottomNav";
import { Badge } from "../ui/shared";
import { ScreenHeader } from "../ui/ScreenHeader";

import TeacherHome from "./teacher-home";

interface HomeProps {
  setActive: (tab: TabName) => void;
  sessionCode?: string | null;
}

// A big tappable dashboard tile — replaces the old plain list row.
const DashboardTile: React.FC<{
  emoji: string;
  label: string;
  sub: string;
  color: string;
  bg: string;
  onPress: () => void;
}> = ({ emoji, label, sub, color, bg, onPress }) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    activeOpacity={0.85}
    style={[styles.tile, { backgroundColor: bg }]}
  >
    <View style={[styles.tileIconWrap, { backgroundColor: color }]}>
      <Text style={styles.tileEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={styles.tileSub}>{sub}</Text>
  </TouchableOpacity>
);

// Stats pills should stay compact — if grade_level includes a section
// ("Grade 5 - Section Acasia"), just show the grade part here so the pill
// doesn't wrap to two lines and throw off the row's height.
const shortGrade = (value?: string | null) => {
  if (!value) return "—";
  return value.split(/\s*-\s*Section/i)[0].trim();
};

// Small stat pill for the overview strip at the top of the dashboard.
const StatCard: React.FC<{ emoji: string; value: string; label: string }> = ({ emoji, value, label }) => (
  <View style={styles.statCard}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// One row in the Recent Activity list.
const ActivityRow: React.FC<{ emoji: string; text: string; time: string }> = ({ emoji, text, time }) => (
  <View style={styles.activityRow}>
    <View style={styles.activityIconWrap}>
      <Text style={styles.activityIcon}>{emoji}</Text>
    </View>
    <Text style={styles.activityText} numberOfLines={1}>{text}</Text>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
);

// Rotates daily so the card isn't static — no backend needed.
const TIPS = [
  "Tap and hold an icon on the AAC Board to hear it spoken slowly.",
  "You can build a full sentence by tapping several icons in a row.",
  "Live Captions works even if your teacher is speaking quickly.",
  "Use the Grade info on your profile to see content matched to you.",
  "Ask your teacher to start a session if you don't see Live Captions.",
];

const Home: React.FC<HomeProps> = ({ setActive, sessionCode: sessionCodeProp }) => {
  const { user, token } = useAuth();
  const [activeSessionCode, setActiveSessionCode] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<
    { id: string | number; emoji: string; text: string; time: string }[]
  >([]);

  useEffect(() => {
    if (!token || user?.status !== "STUDENT") return;

    const checkSession = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sessions/student`, {
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    if (!token || user?.status !== "STUDENT") return;

    const fetchActivity = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/activity/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentActivity(res.data?.items ?? []);
      } catch (e) {
        // Endpoint may not exist yet — fail quietly and show the empty state.
        setRecentActivity([]);
      }
    };

    fetchActivity();
  }, [token, user]);

  if (user?.status === "TEACHER") {
    return <TeacherHome setActive={setActive} />;
  }

  // --- EVERYTHING BELOW THIS LINE ONLY RUNS FOR STUDENTS ---

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const rawUsername = user?.username ?? "";
  const usernameIsEmail = rawUsername.includes("@");
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

        {/* OVERVIEW STRIP */}
        <View style={styles.statsRow}>
          <StatCard emoji="📅" value={shortGrade(user?.grade_level)} label="Grade" />
          <StatCard emoji="🔔" value={activeSessionCode ? "Live" : "None"} label="Session" />
          <StatCard emoji="🟢" value="Online" label="Status" />
        </View>

        {/* MAIN DASHBOARD ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <View style={styles.tileGrid}>
            <DashboardTile
              emoji="🗣"
              label="AAC Board"
              sub="Tap icons to communicate"
              color={C.purple}
              bg={C.purpleLight}
              onPress={() => setActive("board")}
            />
            <DashboardTile
              emoji="📝"
              label="Live Captions"
              sub="See what teacher is saying"
              color="#22C55E"
              bg="#DCFCE7"
              onPress={() => setActive("livecc")}
            />
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 4).map((a) => (
                <ActivityRow key={a.id} emoji={a.emoji} text={a.text} time={a.time} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyText}>Nothing here yet — start using the AAC Board!</Text>
              </View>
            )}
          </View>
        </View>

        {/* TIP OF THE DAY */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Tip of the Day</Text>
              <Text style={styles.tipText}>
                {TIPS[new Date().getDate() % TIPS.length]}
              </Text>
            </View>
          </View>
        </View>

        {/* INFO CARD */}
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

  activeClassBanner: { margin: Spacing.lg, padding: Spacing.lg, backgroundColor: "#10B981", borderRadius: Radius.lg, ...Shadow.md },
  activeClassTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  activeClassIcon: { fontSize: 28 },
  activeClassTitle: { fontSize: FontSize.lg, fontWeight: "800", color: C.white },
  activeClassSub: { fontSize: FontSize.sm, color: "rgba(255,255,255,0.9)", fontWeight: "500", marginTop: 2 },
  activeClassBtn: { backgroundColor: C.white, paddingVertical: 12, borderRadius: Radius.md, alignItems: "center" },
  activeClassBtnText: { color: "#047857", fontWeight: "800", fontSize: FontSize.base },

  // Overview / stats strip
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.gray2,
    paddingVertical: 14,
    paddingHorizontal: 6,
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    ...Shadow.sm,
  },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FontSize.md, fontWeight: "800", color: C.text },
  statLabel: { fontSize: FontSize.xs, color: C.text3, fontWeight: "600" },

  section: { padding: Spacing.lg, gap: 14 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: "800", color: C.text, letterSpacing: -0.5 },

  // Dashboard tile grid (replaces old Quick Express + list)
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 10,
    ...Shadow.sm,
  },
  tileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmoji: { fontSize: 22 },
  tileLabel: { fontSize: FontSize.md, fontWeight: "800", color: C.text },
  tileSub: { fontSize: FontSize.xs, color: C.text3, fontWeight: "500" },

  infoCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: C.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: C.gray2, ...Shadow.sm },
  infoTitle: { fontSize: FontSize.md, fontWeight: "700", color: C.text, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.gray },
  infoIcon: { fontSize: 20 },
  infoLbl: { fontSize: FontSize.sm, color: C.text3, flex: 1, fontWeight: "500" },
  infoVal: { fontSize: FontSize.sm, color: C.text, fontWeight: "700" },

  // Recent activity
  activityCard: {
    backgroundColor: C.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.gray2,
    ...Shadow.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.gray,
  },
  activityIconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: C.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  activityIcon: { fontSize: 16 },
  activityText: { flex: 1, fontSize: FontSize.sm, fontWeight: "600", color: C.text },
  activityTime: { fontSize: FontSize.xs, color: C.text3, fontWeight: "500" },
  emptyState: { alignItems: "center", padding: Spacing.xl, gap: 8 },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: FontSize.sm, color: C.text3, fontWeight: "500", textAlign: "center" },

  // Tip of the day
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.purpleLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  tipEmoji: { fontSize: 22 },
  tipTitle: { fontSize: FontSize.sm, fontWeight: "800", color: C.purple, marginBottom: 4 },
  tipText: { fontSize: FontSize.sm, color: C.text, fontWeight: "500", lineHeight: 20 },
});

export default Home;