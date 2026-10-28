import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from "react-native-reanimated";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { ScreenHeader } from "../ui/ScreenHeader";
import { FontSize, Radius, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import { useLayout } from "../../hooks/useLayout";

const POLL_MS = 1500;

type Speaker = "teacher" | "student" | "event";

interface CCLine {
  id:         string;
  text:       string;
  time:       string;
  speaker:    Speaker;
  name:       string;
  failed?:    boolean;
  eventKind?: "join" | "leave" | "start" | "end";
}

interface LiveCCProps {
  setActive?: (tab: string) => void;
  sessionCode?: string | null;
}

const LiveCC: React.FC<LiveCCProps> = ({ setActive, sessionCode }) => {
  const { token, user } = useAuth();
  const { colors }      = useTheme();
  const { isTablet, isLandscape } = useLayout();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [lines,       setLines]       = useState<CCLine[]>([]);
  const [connected,   setConnected]   = useState(false);
  const [teacherName, setTeacherName] = useState("Teacher");

  const studentName    = (user as any)?.full_name ?? (user as any)?.username ?? "You";
  const lastTsRef      = useRef<string>("");
  const joinedOnceRef  = useRef(false);
  const prevConnected  = useRef(false);

  // ── Pulsing live dot ──────────────────────────────────────────────────────
  const dotOpacity = useSharedValue(1);
  useEffect(() => {
    if (connected) {
      dotOpacity.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: 700 }),
          withTiming(1,    { duration: 700 }),
        ),
        -1,
        false,
      );
    } else {
      dotOpacity.value = 1;
    }
  }, [connected]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  // ── Caption polling — only when in an active session ─────────────────────
  const pollCaptions = useCallback(async () => {
    if (!token || !sessionCode) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/cc/messages/?since=${encodeURIComponent(lastTsRef.current)}&session_code=${sessionCode ?? ""}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const msgs: any[] = res.data;
      if (msgs.length > 0) {
        const formatted: CCLine[] = msgs.map((m) => ({
          id:      m.id,
          text:    m.text,
          time: m.sent_at
            ? new Date(m.sent_at.endsWith("Z") ? m.sent_at : m.sent_at + "Z").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          speaker: m.speaker === "student" ? "student" : "teacher",
          name:    m.sender_name ?? (m.speaker === "student" ? studentName : teacherName),
        }));

        // Pick up teacher name from incoming messages
        const firstTeacher = formatted.find(f => f.speaker === "teacher" && f.name);
        if (firstTeacher) setTeacherName(firstTeacher.name);

        setLines((prev) => {
          const confirmed = new Set(formatted.map((f) => `${f.name}:${f.text}`));
          const withoutDupes = prev.filter(
            (l) => !(l.id.startsWith("local-") && confirmed.has(`${l.name}:${l.text}`)),
          );
          const existingIds = new Set(withoutDupes.map((l) => l.id));
          const newOnly = formatted.filter((f) => !existingIds.has(f.id));
          return [...withoutDupes, ...newOnly];
        });
        lastTsRef.current = msgs[msgs.length - 1].sent_at;
      }
      setConnected(true);

      // Inject "You joined" once on first successful connection
      if (!joinedOnceRef.current) {
        joinedOnceRef.current = true;
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLines(prev => [
          { id: "event-join-self", text: "You joined the session", speaker: "event", name: "System", time, eventKind: "join" },
          ...prev,
        ]);
      }
    } catch {
      // Detect session end: was connected, now failing
      if (prevConnected.current) {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        let endText = "Session has ended";
        try {
          const statusRes = await axios.get(
            `${API_BASE_URL}/sessions/student?session_code=${encodeURIComponent(sessionCode ?? "")}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (statusRes.data?.ended_reason === "inactivity") {
            endText = "Session ended due to inactivity";
          }
        } catch { /* backend unreachable — use generic message */ }
        setLines(prev => [
          ...prev,
          { id: `event-end-${Date.now()}`, text: endText, speaker: "event", name: "System", time, eventKind: "end" },
        ]);
      }
      setConnected(false);
    }
    prevConnected.current = connected;
  }, [token, sessionCode, teacherName, studentName, connected]);

  useEffect(() => {
    if (!token || !sessionCode) return;
    pollCaptions();
    const iv = setInterval(pollCaptions, POLL_MS);
    return () => clearInterval(iv);
  }, [pollCaptions, token, sessionCode]);

  // ── No session gate ───────────────────────────────────────────────────────
  if (!sessionCode) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <Animated.View entering={FadeIn.duration(400)} style={s.noSessionScreen}>
          <Text style={s.noSessionEmoji}>🔒</Text>
          <Text style={s.noSessionTitle}>No Active Session</Text>
          <Text style={s.noSessionSub}>
            Ask your teacher for the session code, then enter it on the Home screen to join.
          </Text>
          <TouchableOpacity
            style={s.noSessionBtn}
            onPress={() => setActive?.("home")}
            activeOpacity={0.82}
          >
            <Text style={s.noSessionBtnText}>Go to Home →</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const captionFeed = (
    <View style={s.ccContainer}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.feed}
        showsVerticalScrollIndicator={true}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {lines.length === 0 ? (
          <Animated.View entering={FadeIn.duration(500)} style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>📡</Text>
            <Text style={s.emptyText}>Waiting for {teacherName} to speak…</Text>
          </Animated.View>
        ) : (
          lines.map((line, idx) => {
            const isLatest  = idx === lines.length - 1;
            const isStudent = line.speaker === "student";

            if (line.speaker === "event") {
              const cfg: Record<string, { bg: string; color: string; icon: string }> = {
                join:  { bg: "rgba(34,197,94,0.12)",  color: "#4ADE80", icon: "🟢" },
                leave: { bg: "rgba(239,68,68,0.12)",  color: "#F87171", icon: "🔴" },
                start: { bg: "rgba(26,173,220,0.12)", color: "#1AADDC", icon: "🎙️" },
                end:   { bg: "rgba(100,116,139,0.15)",color: "#94A3B8", icon: "🔒" },
              };
              const c = cfg[line.eventKind ?? "start"];
              return (
                <Animated.View key={line.id} entering={isLatest ? FadeInUp.duration(280).springify() : undefined}
                  style={[s.eventLine, { backgroundColor: c.bg }]}>
                  <Text style={{ fontSize: 13 }}>{c.icon}</Text>
                  <Text style={[s.eventText, { color: c.color }]}>{line.text}</Text>
                  <Text style={s.eventTime}>{line.time}</Text>
                </Animated.View>
              );
            }

            return (
              <Animated.View
                key={line.id}
                entering={isLatest ? FadeInUp.duration(280).springify() : undefined}
                style={s.ccRow}
              >
                {isLatest && (
                  <View style={[s.activeBar, isStudent && s.activeBarStudent]} />
                )}
                <Text style={s.ccLine}>
                  <Text style={[s.speakerLabel, isStudent ? s.speakerStudent : s.speakerTeacher]}>
                    {line.name}:{" "}
                  </Text>
                  <Text style={[
                    s.ccText,
                    isLatest && s.ccTextLatest,
                    isTablet && { fontSize: 28, lineHeight: 40 },
                    isLatest && isTablet && { fontSize: 34, lineHeight: 46 },
                  ]}>
                    {line.text}
                    {line.failed ? "  ⚠️" : ""}
                  </Text>
                </Text>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  const controls = (
    <View style={[s.bottomArea, isTablet && isLandscape && s.sidePanel]}>
      <View style={s.statusRow}>
        <Animated.View style={[s.liveOrb, !connected && s.liveOrbOff, dotStyle]} />
        <Text style={[s.statusText, isTablet && { fontSize: FontSize.sm }]}>
          {connected ? `Live · ${teacherName}  ·  Code: ${sessionCode}` : "Connecting to class…"}
        </Text>
      </View>

      <TouchableOpacity
        style={s.aacBtn}
        onPress={() => setActive?.("board")}
        activeOpacity={0.82}
      >
        <View style={s.aacBtnIconWrap}>
          <Text style={{ fontSize: isTablet ? 32 : 26 }}>🗣️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.aacBtnTitle, isTablet && { fontSize: FontSize.lg }]}>Open AAC Board</Text>
          <Text style={s.aacBtnSub}>Build a full message for your teacher</Text>
        </View>
        <Text style={s.aacBtnArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScreenHeader
        title="Live Captions"
        subtitle={connected ? `● Live · ${teacherName}` : "○ Connecting…"}
      />

      {isTablet && isLandscape ? (
        <View style={s.landscapeRow}>
          {captionFeed}
          {controls}
        </View>
      ) : (
        <>
          {captionFeed}
          {controls}
        </>
      )}
    </SafeAreaView>
  );
};

const TEAL   = "#1AADDC";
const PURPLE = "#534AB7";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1A1B1E" },

  // No-session gate
  noSessionScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl, gap: 16 },
  noSessionEmoji:  { fontSize: 64 },
  noSessionTitle:  { fontSize: 22, fontWeight: "800", color: "#F9FAFB", textAlign: "center" },
  noSessionSub:    { fontSize: FontSize.base, color: "#6B7280", textAlign: "center", lineHeight: 26 },
  noSessionBtn:    { marginTop: 8, backgroundColor: "#7C5CFC", borderRadius: 999, paddingHorizontal: 28, paddingVertical: 14 },
  noSessionBtnText:{ fontSize: FontSize.base, fontWeight: "800", color: "#FFF" },

  // Caption area
  ccContainer: { flex: 1 },
  feed:        { padding: Spacing.lg, gap: 16, flexGrow: 1 },

  emptyWrap:  { alignItems: "center", marginTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 36, opacity: 0.5 },
  emptyText:  { fontSize: FontSize.base, color: "#6B7280", fontStyle: "italic", textAlign: "center", lineHeight: 24 },

  eventLine: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, marginHorizontal: 2 },
  eventText: { flex: 1, fontSize: 13, fontWeight: "500", fontStyle: "italic" },
  eventTime: { fontSize: 11, color: "#6B7280" },

  ccRow:           { flexDirection: "row", alignItems: "flex-start", paddingLeft: 14 },
  activeBar:       { width: 3, height: "100%", backgroundColor: TEAL, position: "absolute", left: 0, borderRadius: 2 },
  activeBarStudent:{ backgroundColor: "#4ADE80" },
  ccLine:          { flexShrink: 1 },
  speakerLabel:    { fontSize: 14, fontWeight: "800" },
  speakerTeacher:  { color: TEAL },
  speakerStudent:  { color: "#4ADE80" },
  ccText:          { fontSize: 24, color: "#D1D5DB", lineHeight: 32, fontWeight: "500" },
  ccTextLatest:    { color: "#FFFFFF", fontWeight: "700", fontSize: 28, lineHeight: 38 },

  // Bottom area
  bottomArea: {
    borderTopWidth: 1, borderTopColor: "#2D2F34",
    backgroundColor: "#22242A",
    paddingHorizontal: Spacing.lg,
    paddingTop: 14, paddingBottom: 18,
    gap: 12,
  },
  statusRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  liveOrb:    { width: 8, height: 8, borderRadius: 999, backgroundColor: TEAL },
  liveOrbOff: { backgroundColor: "#4B5563" },
  statusText: { fontSize: FontSize.xs, color: "#6B7280", fontWeight: "600", letterSpacing: 0.3 },

  aacBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#2D2B52",
    borderRadius: Radius.lg, padding: 16,
    borderWidth: 1.5, borderColor: "rgba(83,74,183,0.55)",
  },
  aacBtnIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: PURPLE,
    alignItems: "center", justifyContent: "center",
  },
  aacBtnTitle: { fontSize: FontSize.md, fontWeight: "800", color: "#F3F4F6" },
  aacBtnSub:   { fontSize: FontSize.xs, color: "#6B7280", marginTop: 3, fontWeight: "500" },
  aacBtnArrow: { fontSize: 26, color: "#534AB7", fontWeight: "300", marginRight: 2 },

  // Tablet landscape split layout
  landscapeRow: { flex: 1, flexDirection: "row" },
  sidePanel: {
    width: 320,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: "#2D2F34",
    justifyContent: "center",
  },
});

export default LiveCC;
