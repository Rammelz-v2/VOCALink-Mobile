import React, { useEffect, useState } from "react";
import {
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { getSentMessages, relativeTime } from "../../utils/sentMessages";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import type { TabName } from "../ui/BottomNav";
import { Badge } from "../ui/shared";
import { ScreenHeader } from "../ui/ScreenHeader";
import { useLayout } from "../../hooks/useLayout";
import DashboardTile from "../home/DashboardTile";
import StatCard from "../home/StatCard";
import ActivityRow from "../home/ActivityRow";
import JoinSessionCard from "../home/JoinSessionCard";
import ActiveSessionBanner from "../home/ActiveSessionBanner";

interface HomeProps {
  setActive: (tab: TabName) => void;
  sessionCode?: string | null;
  joinSession?: (code: string) => Promise<{ ok: boolean; error?: string }>;
  leaveSession?: () => void;
  joining?: boolean;
  joinError?: string | null;
}

const shortGrade = (value?: string | null) => {
  if (!value) return "—";
  return value.split(/\s*-\s*Section/i)[0].trim();
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
  const { user } = useAuth();
  const { colors } = useTheme();
  const { isTablet, isLandscape, hPad } = useLayout();
  const [recentActivity, setRecentActivity] = useState<
    { id: string | number; emoji: string; text: string; time: string }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      const msgs = await getSentMessages();
      setRecentActivity(
        msgs.map(m => ({ id: m.id, emoji: "📤", text: m.text, time: relativeTime(m.ts) }))
      );
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const rawUsername = user?.username ?? "";
  const usernameIsEmail = rawUsername.includes("@");
  const displayName =
    user?.first_name ||
    (!usernameIsEmail ? rawUsername : rawUsername.split("@")[0]) ||
    "Student";

  const sessionSection = !sessionCode ? (
    <JoinSessionCard
      joinError={joinError}
      joining={joining}
      onJoin={joinSession ?? (() => Promise.resolve({ ok: false }))}
      hPad={hPad}
      isLandscape={isLandscape}
    />
  ) : (
    <ActiveSessionBanner
      sessionCode={sessionCode}
      onGoToLiveCC={() => setActive("livecc")}
      onLeave={() => leaveSession?.()}
      hPad={hPad}
      isLandscape={isLandscape}
    />
  );

  const statsSection = (
    <View style={[styles.statsRow, { paddingHorizontal: hPad }]}>
      {[
        { emoji: "📅", value: shortGrade(user?.grade_level), label: "Grade" },
        { emoji: "🔔", value: sessionCode ? "Live" : "None", label: "Session" },
        { emoji: "🗣", value: user?.disability_type ? "Set" : "—", label: "Comm. Type" },
      ].map((stat, i) => (
        <Animated.View key={stat.label} entering={isLandscape ? FadeIn.delay(i * 70) : FadeInDown.delay(i * 70).springify()} style={{ flex: 1 }}>
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
          { emoji: "🗣", label: "AAC Board", sub: "Tap icons to communicate", color: C.purple, bg: colors.purpleLight, tab: "board" as const },
          { emoji: "📝", label: "Live Captions", sub: "See what teacher is saying", color: "#0E8DB8", bg: colors.tealLight, tab: "livecc" as const },
        ].map((tile, i) => (
          <Animated.View
            key={tile.tab}
            entering={isLandscape ? FadeIn.delay(150 + i * 80) : FadeInDown.delay(150 + i * 80).springify()}
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
    <Animated.View entering={isLandscape ? FadeIn.delay(300) : FadeInDown.delay(300).springify()} style={[styles.section, { paddingHorizontal: hPad }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Messages Sent</Text>
      <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {recentActivity.length > 0 ? (
          recentActivity.slice(0, 5).map((a) => (
            <ActivityRow key={a.id} emoji={a.emoji} text={a.text} time={a.time} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📤</Text>
            <Text style={styles.emptyText}>No messages sent yet — build a sentence on the AAC Board and tap Send!</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const tipSection = (
    <Animated.View entering={isLandscape ? FadeIn.delay(380) : FadeInDown.delay(380).springify()} style={[styles.section, { paddingHorizontal: hPad }]}>
      <View style={[styles.tipCard, { backgroundColor: colors.tealLight }]}>
        <Text style={styles.tipEmoji}>💡</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.tipTitle, { color: colors.text2 }]}>Tip of the Day</Text>
          <Text style={[styles.tipText, { color: colors.text }]}>
            {TIPS[new Date().getDate() % TIPS.length]}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  if (isLandscape) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <View style={{ zIndex: 100, elevation: 6 }}>
          <ScreenHeader
            title={`${greeting}, ${displayName} 👋`}
            subtitle="VocaLink — Your voice matters"
            right={<Badge color="green">Online</Badge>}
          />
        </View>
        <View style={styles.splitRow}>
          <ScrollView style={styles.splitCol} contentContainerStyle={styles.splitColContent} showsVerticalScrollIndicator={false}>
            {sessionSection}
            {statsSection}
          </ScrollView>
          <View style={[styles.splitDivider, { backgroundColor: colors.border }]} />
          <ScrollView style={styles.splitCol} contentContainerStyle={[styles.splitColContent, styles.splitRightCol]} showsVerticalScrollIndicator={false}>
            {dashboardSection}
            {activitySection}
            {tipSection}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 100 },

  splitRow: { flex: 1, flexDirection: "row" },
  splitCol: { flex: 1 },
  splitColContent: { paddingBottom: 40, paddingTop: 4 },
  splitRightCol:   { paddingTop: 4 },
  splitDivider: { width: 1, backgroundColor: C.gray2 },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: Spacing.md,
  },

  section: { paddingVertical: Spacing.lg, gap: 14 },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: "800", letterSpacing: -0.5,
    borderLeftWidth: 3, borderLeftColor: "#1AADDC", paddingLeft: 10,
  },

  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  activityCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.gray2,
    ...Shadow.sm,
  },
  emptyState: { alignItems: "center", padding: Spacing.xl, gap: 8 },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: FontSize.sm, color: C.text3, fontWeight: "500", textAlign: "center" },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  tipEmoji: { fontSize: 22 },
  tipTitle: { fontSize: FontSize.sm, fontWeight: "800", color: C.teal, marginBottom: 4 },
  tipText: { fontSize: FontSize.sm, fontWeight: "500", lineHeight: 20 },
});

export default Home;
