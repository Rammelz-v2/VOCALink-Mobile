import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import type { TabName } from "../ui/BottomNav";
import { Badge } from "../ui/shared";
import { ScreenHeader } from "../ui/ScreenHeader";
import { useLayout } from "../../hooks/useLayout";

import TeacherHome from "./teacher-home";

interface HomeProps {
  setActive: (tab: TabName) => void;
  sessionCode?: string | null;
  joinSession?: (code: string) => Promise<{ ok: boolean; error?: string }>;
  leaveSession?: () => void;
  joining?: boolean;
  joinError?: string | null;
}

const DashboardTile: React.FC<{
  emoji: string;
  label: string;
  sub: string;
  color: string;
  bg: string;
  onPress: () => void;
  large?: boolean;
}> = ({ emoji, label, sub, color, bg, onPress, large }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.85}
      style={[styles.tile, { backgroundColor: bg }]}
    >
      <View style={[styles.tileIconWrap, { backgroundColor: color }, large && { width: 56, height: 56, borderRadius: 16 }]}>
        <Text style={[styles.tileEmoji, large && { fontSize: 30 }]}>{emoji}</Text>
      </View>
      <Text style={[styles.tileLabel, large && { fontSize: FontSize.lg }, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.tileSub, large && { fontSize: FontSize.sm }, { color: colors.text3 }]}>{sub}</Text>
    </TouchableOpacity>
  );
};

const shortGrade = (value?: string | null) => {
  if (!value) return "—";
  return value.split(/\s*-\s*Section/i)[0].trim();
};

const StatCard: React.FC<{ emoji: string; value: string; label: string; large?: boolean }> = ({ emoji, value, label, large }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, large && { minHeight: 100, paddingVertical: 18 }, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statEmoji, large && { fontSize: 26 }]}>{emoji}</Text>
      <Text style={[styles.statValue, large && { fontSize: 20 }, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={[styles.statLabel, large && { fontSize: FontSize.sm }, { color: colors.text3 }]}>{label}</Text>
    </View>
  );
};

const ActivityRow: React.FC<{ emoji: string; text: string; time: string }> = ({ emoji, text, time }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.activityRow, { borderBottomColor: colors.borderSubtle }]}>
      <View style={[styles.activityIconWrap, { backgroundColor: colors.borderSubtle }]}>
        <Text style={styles.activityIcon}>{emoji}</Text>
      </View>
      <Text style={[styles.activityText, { color: colors.text }]} numberOfLines={1}>{text}</Text>
      <Text style={[styles.activityTime, { color: colors.text3 }]}>{time}</Text>
    </View>
  );
};

const TIPS = [
  "Tap and hold an icon on the AAC Board to hear it spoken slowly.",
  "You can build a full sentence by tapping several icons in a row.",
  "Live Captions works even if your teacher is speaking quickly.",
  "Use the Grade info on your profile to see content matched to you.",
  "Ask your teacher to start a session if you don't see Live Captions.",
];

const Home: React.FC<HomeProps> = ({
  setActive,
  sessionCode,
  joinSession,
  leaveSession,
  joining = false,
  joinError,
}) => {
  const { user, token } = useAuth();
  const { colors }      = useTheme();
  const { isTablet, isLandscape, hPad } = useLayout();
  const [codeInput, setCodeInput] = useState("");
  const [recentActivity, setRecentActivity] = useState<
    { id: string | number; emoji: string; text: string; time: string }[]
  >([]);

  useEffect(() => {
    if (!token || user?.status !== "STUDENT") return;
    const fetchActivity = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/activity/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentActivity(res.data?.items ?? []);
      } catch {
        setRecentActivity([]);
      }
    };
    fetchActivity();
  }, [token, user]);

  if (user?.status === "TEACHER") {
    return <TeacherHome setActive={setActive} />;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const rawUsername = user?.username ?? "";
  const usernameIsEmail = rawUsername.includes("@");
  const displayName =
    user?.first_name ||
    (!usernameIsEmail ? rawUsername : rawUsername.split("@")[0]) ||
    "Student";

  // ── Section fragments ─────────────────────────────────────────────────────

  const sessionSection = !sessionCode ? (
    <Animated.View entering={FadeIn.duration(350)} style={[styles.joinCard, { marginHorizontal: hPad, backgroundColor: colors.surface }]}>
      <View style={styles.joinHeader}>
        <View style={styles.joinIconWrap}>
          <Text style={{ fontSize: 26 }}>📡</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.joinTitle, { color: colors.text }]}>Join a Class Session</Text>
          <Text style={[styles.joinSub, { color: colors.text3 }]}>Enter the code your teacher shared</Text>
        </View>
      </View>
      <TextInput
        style={[styles.joinInput, { backgroundColor: colors.input, color: colors.text }]}
        value={codeInput}
        onChangeText={(t) => setCodeInput(t.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        placeholder="e.g. ABC123"
        placeholderTextColor={colors.text3}
        autoCapitalize="characters"
        maxLength={8}
        autoCorrect={false}
      />
      {joinError ? (
        <View style={styles.joinErrorRow}>
          <Text style={styles.joinError}>⚠️  {joinError}</Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={[styles.joinBtn, (!codeInput.trim() || joining) && styles.joinBtnOff]}
        disabled={!codeInput.trim() || joining}
        activeOpacity={0.85}
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const result = await joinSession?.(codeInput);
          if (result?.ok) {
            setCodeInput("");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }}
      >
        {joining
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.joinBtnText}>Join Session →</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  ) : (
    <Animated.View entering={FadeIn.duration(350)} style={{ marginHorizontal: hPad }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setActive("livecc");
        }}
        style={styles.activeClassBanner}
      >
        <View style={styles.activeClassTop}>
          <Text style={styles.activeClassIcon}>🟢</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.activeClassTitle}>Session Active!</Text>
            <Text style={styles.activeClassSub}>Code: {sessionCode}</Text>
          </View>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); leaveSession?.(); }}
            style={styles.leaveBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.leaveBtnText}>Leave</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activeClassBtn}>
          <Text style={styles.activeClassBtnText}>Go to Live CC Room →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const statsSection = (
    <View style={[styles.statsRow, { paddingHorizontal: hPad }]}>
      {[
        { emoji: "📅", value: shortGrade(user?.grade_level), label: "Grade" },
        { emoji: "🔔", value: sessionCode ? "Live" : "None", label: "Session" },
        { emoji: "🟢", value: "Online", label: "Status" },
      ].map((stat, i) => (
        <Animated.View key={stat.label} entering={FadeInDown.delay(i * 70).springify()} style={{ flex: 1 }}>
          <StatCard emoji={stat.emoji} value={stat.value} label={stat.label} large={isTablet} />
        </Animated.View>
      ))}
    </View>
  );

  const dashboardSection = (
    <View style={[styles.section, { paddingHorizontal: hPad }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Dashboard</Text>
      <View style={styles.tileGrid}>
        {[
          { emoji: "🗣", label: "AAC Board", sub: "Tap icons to communicate", color: C.purple, bg: C.purpleLight, tab: "board" as const },
          { emoji: "📝", label: "Live Captions", sub: "See what teacher is saying", color: "#0E8DB8", bg: "#E0F5FC", tab: "livecc" as const },
        ].map((tile, i) => (
          <Animated.View
            key={tile.tab}
            entering={FadeInDown.delay(150 + i * 80).springify()}
            style={{ flexBasis: "47%", flexGrow: 1 }}
          >
            <DashboardTile
              emoji={tile.emoji}
              label={tile.label}
              sub={tile.sub}
              color={tile.color}
              bg={tile.bg}
              onPress={() => setActive(tile.tab)}
              large={isTablet}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const activitySection = (
    <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.section, { paddingHorizontal: hPad }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
      <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
    </Animated.View>
  );

  const tipSection = (
    <Animated.View entering={FadeInDown.delay(380).springify()} style={[styles.section, { paddingHorizontal: hPad }]}>
      <View style={[styles.tipCard, { backgroundColor: colors.purpleLight }]}>
        <Text style={styles.tipEmoji}>💡</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Tip of the Day</Text>
          <Text style={styles.tipText}>
            {TIPS[new Date().getDate() % TIPS.length]}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const infoSection = (
    <Animated.View entering={FadeInDown.delay(450).springify()} style={[styles.infoCard, { marginHorizontal: hPad, backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.infoTitle, { color: colors.text }]}>My Info</Text>
      {[
        { icon: "👤", lbl: "Name", val: displayName },
        { icon: "🏷", lbl: "Username", val: user?.username ?? "—" },
        { icon: "📚", lbl: "Grade", val: user?.grade_level ?? "—" },
      ].map((r, i) => (
        <View key={i} style={[styles.infoRow, { borderBottomColor: colors.borderSubtle }]}>
          <Text style={styles.infoIcon}>{r.icon}</Text>
          <Text style={[styles.infoLbl, { color: colors.text3 }]}>{r.lbl}</Text>
          <Text style={[styles.infoVal, { color: colors.text }]}>{r.val}</Text>
        </View>
      ))}
    </Animated.View>
  );

  // ── Tablet landscape: two-column split ───────────────────────────────────
  if (isTablet && isLandscape) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <ScreenHeader
          title={`${greeting}, ${displayName} 👋`}
          subtitle="VocaLink — Your voice matters"
          right={<Badge color="green">Online</Badge>}
        />
        <View style={styles.splitRow}>
          <ScrollView style={styles.splitCol} contentContainerStyle={styles.splitColContent} showsVerticalScrollIndicator={false}>
            {sessionSection}
            {statsSection}
            {infoSection}
          </ScrollView>
          <View style={[styles.splitDivider, { backgroundColor: colors.border }]} />
          <ScrollView style={styles.splitCol} contentContainerStyle={styles.splitColContent} showsVerticalScrollIndicator={false}>
            {dashboardSection}
            {activitySection}
            {tipSection}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ── Phone / tablet portrait: single column ───────────────────────────────
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={`${greeting}, ${displayName} 👋`}
          subtitle="VocaLink — Your voice matters"
          right={<Badge color="green">Online</Badge>}
        />
        {sessionSection}
        {statsSection}
        {dashboardSection}
        {activitySection}
        {tipSection}
        {infoSection}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 40 },

  // Tablet landscape two-column split
  splitRow: { flex: 1, flexDirection: "row" },
  splitCol: { flex: 1 },
  splitColContent: { paddingBottom: 40 },
  splitDivider: { width: 1, backgroundColor: C.gray2 },

  // ── Join form ──────────────────────────────────────────────────────────────
  joinCard: {
    marginVertical: Spacing.lg,
    backgroundColor: C.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(124,92,252,0.18)",
    ...Shadow.md,
    shadowColor: "#2D226A",
  },
  joinHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  joinIconWrap: {
    width: 52, height: 52, borderRadius: Radius.lg,
    backgroundColor: C.purpleLight,
    alignItems: "center", justifyContent: "center",
  },
  joinTitle: { fontSize: FontSize.lg, fontWeight: "800", color: C.text },
  joinSub:   { fontSize: FontSize.xs, color: C.text3, fontWeight: "500", marginTop: 3 },
  joinInput: {
    backgroundColor: "#F4F2FF",
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: "rgba(124,92,252,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#2D226A",
    letterSpacing: 4,
    textAlign: "center",
  },
  joinErrorRow: { alignItems: "center" },
  joinError:    { fontSize: FontSize.sm, color: "#EF4444", fontWeight: "600", textAlign: "center" },
  joinBtn: {
    backgroundColor: "#7C5CFC",
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: "center",
    ...Shadow.sm,
  },
  joinBtnOff: { backgroundColor: "#C4B5FD", ...Shadow.sm },
  joinBtnText: { fontSize: FontSize.base, fontWeight: "800", color: C.white },

  // ── Active session banner ──────────────────────────────────────────────────
  leaveBtn:     { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  leaveBtnText: { fontSize: FontSize.xs, fontWeight: "700", color: C.white },
  activeClassBanner: { marginVertical: Spacing.lg, padding: Spacing.lg, backgroundColor: "#10B981", borderRadius: Radius.lg, ...Shadow.md },
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
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(124,92,252,0.18)",
    paddingVertical: 14,
    paddingHorizontal: 6,
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    ...Shadow.sm,
    shadowColor: "#2D226A",
  },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: FontSize.md, fontWeight: "800", color: C.text },
  statLabel: { fontSize: FontSize.xs, color: C.text3, fontWeight: "600" },

  section: { paddingVertical: Spacing.lg, gap: 14 },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: "800", color: C.text, letterSpacing: -0.5,
    borderLeftWidth: 3, borderLeftColor: "#7C5CFC", paddingLeft: 10,
  },

  // Dashboard tile grid
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  tile: {
    flex: 1,
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

  infoCard: {
    marginBottom: Spacing.lg,
    backgroundColor: C.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.gray2,
    ...Shadow.sm,
  },
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
