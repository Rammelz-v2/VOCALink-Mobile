/**
 * livecc.tsx — STUDENT SCREEN
 *
 * Shows live teacher captions + AAC icon tray.
 * No text messaging — students respond only via AAC icons.
 * Student taps are logged via POST /api/logs/ (already existed on the
 * backend); GET /api/cc/messages/ now merges those AAC taps together with
 * teacher captions into one shared, time-ordered feed, so this screen no
 * longer needs to fake anything client-side.
 * Polls session status every 2 s so the screen updates the moment the
 * teacher starts/ends the class, and picks up the teacher's display name
 * directly from /api/sessions/student.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { ScreenHeader } from "../ui/ScreenHeader";
import { Colors as C, FontSize, Radius, Spacing } from "../../constants/tokens";

const POLL_MS      = 1500;
const SESSION_MS   = 2000;

const LIVE_ICONS = [
  { id: "help",     emoji: "✋", label: "Help me",       msg: "Help me!",          bg: "#FAEEDA" },
  { id: "yes",      emoji: "✅", label: "Yes",            msg: "Yes",               bg: "#E1F5EE" },
  { id: "no",       emoji: "❌", label: "No",             msg: "No",                bg: "#FCEBEB" },
  { id: "done",     emoji: "📖", label: "Done",           msg: "I'm done",          bg: "#E1F5EE" },
  { id: "question", emoji: "❓", label: "Question",       msg: "I have a question", bg: "#E6F1FB" },
  { id: "repeat",   emoji: "🔁", label: "Repeat",         msg: "Please repeat",     bg: "#EEEDFE" },
  { id: "wait",     emoji: "⏳", label: "Wait",           msg: "Wait please",       bg: "#FAEEDA" },
  { id: "confused", emoji: "😕", label: "Confused",       msg: "I'm confused",      bg: "#E1F5EE" },
];

// A line in the feed is either a teacher caption or a student icon tap.
type Speaker = "teacher" | "student";

interface CCLine {
  id:      string;
  text:    string;
  time:    string;
  speaker: Speaker;
  name:    string;   // display name of whoever said it
  failed?: boolean;  // true if the optimistic POST never made it to the server
}

// Local (student-tap) lines get a "local-" prefixed id so they never
// collide with server ids ("cc-<id>" / "aac-<id>") and are easy to spot
// for dedup once the server confirms the real one.
let localIdCounter = 0;

const LiveCC: React.FC = () => {
  const { token, user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [lines,          setLines]          = useState<CCLine[]>([]);
  const [connected,      setConnected]      = useState(false);
  const [sessionActive,  setSessionActive]  = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [teacherName,    setTeacherName]    = useState("Teacher");

  const studentName = (user as any)?.full_name ?? (user as any)?.username ?? "You";
  const lastTsRef   = useRef<string>(""); // ISO timestamp cursor for polling

  // ── Caption polling ───────────────────────────────────────────────────────
  const pollCaptions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/cc/messages/?since=${encodeURIComponent(lastTsRef.current)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const msgs: any[] = res.data;
      if (msgs.length > 0) {
        const formatted: CCLine[] = msgs.map((m) => ({
          id:      m.id, // "cc-12" or "aac-7"
          text:    m.text,
          time: m.sent_at
            ? new Date(m.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          speaker: m.speaker === "student" ? "student" : "teacher",
          name:    m.sender_name ?? (m.speaker === "student" ? studentName : teacherName),
        }));

        setLines((prev) => {
          // Drop any local optimistic lines that this batch just confirmed
          // from the server, so the same tap doesn't show twice.
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
  }, [token, teacherName, studentName]);

  useEffect(() => {
    if (!token) return;
    pollCaptions();
    const iv = setInterval(pollCaptions, POLL_MS);
    return () => clearInterval(iv);
  }, [pollCaptions, token]);

  // ── Session status polling — detects when teacher starts/ends class ──────
  useEffect(() => {
    if (!token) return;
    const checkSession = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/sessions/student`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSessionActive(res.data.active);
        setSessionChecked(true);
        if (res.data.teacher_name) setTeacherName(res.data.teacher_name);
      } catch {}
    };
    checkSession();
    const iv = setInterval(checkSession, SESSION_MS);
    return () => clearInterval(iv);
  }, [token]);

  // ── AAC icon tap → shows in feed immediately + logged to the backend ────
  const handleIconTap = async (icon: typeof LIVE_ICONS[0]) => {
    if (!token) return;

    const clientId = `local-${localIdCounter++}`;

    // Optimistically drop it into the feed right away, labeled with the
    // student's own name, so they see their tap appear like a chat message.
    const newLine: CCLine = {
      id:      clientId,
      text:    icon.msg,
      time:    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      speaker: "student",
      name:    studentName,
    };
    setLines((prev) => [...prev, newLine]);

    try {
      // This already existed on the backend and is what actually persists
      // the tap. GET /cc/messages/ now merges these into the shared live
      // feed automatically — no separate "post to the feed" call needed.
      await axios.post(
        `${API_BASE_URL}/logs/`,
        { icon_id: icon.id, icon_label: icon.label, message: icon.msg },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      // Don't leave a silent "ghost" message — mark it so the student knows
      // it didn't actually go out and can try again.
      setLines((prev) =>
        prev.map((l) => (l.id === clientId ? { ...l, failed: true } : l)),
      );
    }
  };

  // Last 6 lines fade older ones (Google Meet style)
  const visible = lines.slice(-6);

  // ── Session ended overlay ─────────────────────────────────────────────────
  if (sessionChecked && !sessionActive) {
    return (
      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
        <View style={s.endedScreen}>
          <Text style={s.endedEmoji}>🎓</Text>
          <Text style={s.endedTitle}>Class has ended</Text>
          <Text style={s.endedSub}>
            {teacherName} has ended the session.{"\n"}
            Your participation has been saved.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

      {/* Header */}
      <ScreenHeader
        title="Live Captions"
        subtitle={
          connected
            ? `● Live from ${teacherName}`
            : "○ Connecting to class…"
        }
      />

      {/* Caption feed */}
      <View style={s.ccContainer}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.feed}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {visible.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>Waiting for {teacherName} to speak…</Text>
            </View>
          ) : (
            visible.map((line, idx) => {
              const isLatest   = idx === visible.length - 1;
              const isStudent  = line.speaker === "student";
              const opacity    = isLatest
                ? 1
                : 0.3 + (idx / Math.max(visible.length - 1, 1)) * 0.5;
              return (
                <View key={line.id} style={[s.ccRow, { opacity }]}>
                  {isLatest && (
                    <View
                      style={[
                        s.activeBar,
                        isStudent && { backgroundColor: "#81C995" },
                      ]}
                    />
                  )}
                  <Text style={s.ccLine}>
                    <Text
                      style={[
                        s.speakerLabel,
                        isStudent ? s.speakerLabelStudent : s.speakerLabelTeacher,
                      ]}
                    >
                      {line.name}:{" "}
                    </Text>
                    <Text style={[s.ccText, isLatest && s.ccTextLatest]}>
                      {line.text}
                      {line.failed ? "  ⚠️ not sent" : ""}
                    </Text>
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* AAC icon tray */}
      <View style={s.iconTrayWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.iconTrayRow}
        >
          {LIVE_ICONS.map((icon) => (
            <TouchableOpacity
              key={icon.id}
              onPress={() => handleIconTap(icon)}
              style={[s.iconTile, { backgroundColor: icon.bg }]}
              activeOpacity={0.7}
            >
              <Text style={s.iconTileEmoji}>{icon.emoji}</Text>
              <Text style={s.iconTileLabel}>{icon.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: "#202124" },

  // Caption area
  ccContainer:   { flex: 1, justifyContent: "flex-end", paddingBottom: 8 },
  feed:          { padding: Spacing.lg, gap: 14, justifyContent: "flex-end", flexGrow: 1 },
  emptyWrap:     { alignItems: "center", marginTop: 60 },
  emptyText:     { fontSize: FontSize.md, color: "#9AA0A6", fontStyle: "italic", textAlign: "center" },
  ccRow:         { flexDirection: "row", alignItems: "flex-start", paddingLeft: 12 },
  activeBar:     { width: 4, height: "100%", backgroundColor: "#8AB4F8", position: "absolute", left: -2, borderRadius: 2 },
  ccLine:        { flexShrink: 1 },
  speakerLabel:  { fontSize: 15, fontWeight: "800" },
  speakerLabelTeacher: { color: "#8AB4F8" },
  speakerLabelStudent: { color: "#81C995" },
  ccText:        { fontSize: 26, color: "#E8EAED", lineHeight: 34, fontWeight: "500" },
  ccTextLatest:  { color: "#FFF", fontWeight: "700", fontSize: 28, lineHeight: 36 },

  // AAC icon tray
  iconTrayWrap:  { borderTopWidth: 1, borderTopColor: "#3C4043", backgroundColor: "#2D2F31", paddingVertical: 10 },
  iconTrayRow:   { paddingHorizontal: Spacing.md, gap: 10, alignItems: "center" },
  iconTile:      { alignItems: "center", justifyContent: "center", borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10, minWidth: 68, gap: 4 },
  iconTileEmoji: { fontSize: 26 },
  iconTileLabel: { fontSize: 11, fontWeight: "700", color: "#202124", textAlign: "center" },

  // Session ended screen
  endedScreen:   { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl, gap: 16 },
  endedEmoji:    { fontSize: 64 },
  endedTitle:    { fontSize: FontSize.xl, fontWeight: "800", color: "#FFF", textAlign: "center" },
  endedSub:      { fontSize: FontSize.base, color: "#9AA0A6", textAlign: "center", lineHeight: 24 },
});

export default LiveCC;