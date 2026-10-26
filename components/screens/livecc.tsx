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

const POLL_MS = 1500;

type Speaker = "teacher" | "student";

interface CCLine {
  id:      string;
  text:    string;
  time:    string;
  speaker: Speaker;
  name:    string;
  failed?: boolean;
}

interface LiveCCProps {
  setActive?: (tab: string) => void;
  sessionCode?: string | null;
}

const LiveCC: React.FC<LiveCCProps> = ({ setActive, sessionCode }) => {
  const { token, user } = useAuth();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [lines,       setLines]       = useState<CCLine[]>([]);
  const [connected,   setConnected]   = useState(false);
  const [teacherName, setTeacherName] = useState("Teacher");

  const studentName = (user as any)?.full_name ?? (user as any)?.username ?? "You";
  const lastTsRef   = useRef<string>("");

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
            ? new Date(m.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
          return [...withoutDupes, ...formatted];
        });
        lastTsRef.current = msgs[msgs.length - 1].sent_at;
      }
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [token, sessionCode, teacherName, studentName]);

  useEffect(() => {
    if (!token || !sessionCode) return;
    pollCaptions();
    const iv = setInterval(pollCaptions, POLL_MS);
    return () => clearInterval(iv);
  }, [pollCaptions, token, sessionCode]);

  // ── No session gate ───────────────────────────────────────────────────────
  if (!sessionCode) {
    return (
      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
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

  const visible = lines.slice(-6);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

      <ScreenHeader
        title="Live Captions"
        subtitle={connected ? `● Live · ${teacherName}` : "○ Connecting…"}
      />

      {/* ── Caption feed ─────────────────────────────────────────────── */}
      <View style={s.ccContainer}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.feed}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {visible.length === 0 ? (
            <Animated.View entering={FadeIn.duration(500)} style={s.emptyWrap}>
              <Text style={s.emptyEmoji}>📡</Text>
              <Text style={s.emptyText}>Waiting for {teacherName} to speak…</Text>
            </Animated.View>
          ) : (
            visible.map((line, idx) => {
              const isLatest  = idx === visible.length - 1;
              const isStudent = line.speaker === "student";
              const opacity   = isLatest
                ? 1
                : 0.3 + (idx / Math.max(visible.length - 1, 1)) * 0.5;
              return (
                <Animated.View
                  key={line.id}
                  entering={isLatest ? FadeInUp.duration(280).springify() : undefined}
                  style={[s.ccRow, { opacity }]}
                >
                  {isLatest && (
                    <View style={[s.activeBar, isStudent && s.activeBarStudent]} />
                  )}
                  <Text style={s.ccLine}>
                    <Text style={[s.speakerLabel, isStudent ? s.speakerStudent : s.speakerTeacher]}>
                      {line.name}:{" "}
                    </Text>
                    <Text style={[s.ccText, isLatest && s.ccTextLatest]}>
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

      {/* ── Bottom area ──────────────────────────────────────────────── */}
      <View style={s.bottomArea}>

        <View style={s.statusRow}>
          <Animated.View style={[s.liveOrb, !connected && s.liveOrbOff, dotStyle]} />
          <Text style={s.statusText}>
            {connected ? `Live · ${teacherName}  ·  Code: ${sessionCode}` : "Connecting to class…"}
          </Text>
        </View>

        <TouchableOpacity
          style={s.aacBtn}
          onPress={() => setActive?.("board")}
          activeOpacity={0.82}
        >
          <View style={s.aacBtnIconWrap}>
            <Text style={{ fontSize: 26 }}>🗣️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.aacBtnTitle}>Open AAC Board</Text>
            <Text style={s.aacBtnSub}>Build a full message for your teacher</Text>
          </View>
          <Text style={s.aacBtnArrow}>›</Text>
        </TouchableOpacity>

      </View>

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
  ccContainer: { flex: 1, justifyContent: "flex-end" },
  feed:        { padding: Spacing.lg, gap: 16, justifyContent: "flex-end", flexGrow: 1 },

  emptyWrap:  { alignItems: "center", marginTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 36, opacity: 0.5 },
  emptyText:  { fontSize: FontSize.base, color: "#6B7280", fontStyle: "italic", textAlign: "center", lineHeight: 24 },

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
});

export default LiveCC;
