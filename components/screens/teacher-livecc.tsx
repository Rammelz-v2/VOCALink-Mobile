/**
 * teacher-livecc.tsx  — POLLING VERSION (no WebSocket)
 *
 * Teacher types or holds 🎙️ to speak → transcribed via STT → auto-broadcast.
 * Polls own broadcast feed + student replies every 1.5 s so both streams
 * appear together in the live room feed.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../constants/api";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";

const POLL_MS = 1500;

interface Props { setActive: (tab: any) => void; }

interface CCLine {
  id:           number | string;
  text:         string;
  speaker:      "teacher" | "student";
  time:         string;
  studentName?: string;
}

export default function TeacherLiveCC({ setActive }: Props) {
  const { token } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [lines, setLines]               = useState<CCLine[]>([]);
  const [input, setInput]               = useState("");
  const [isSending, setIsSending]       = useState(false);
  const lastCCIdRef  = useRef<number>(0);
  const lastAacIdRef = useRef<number>(0);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll captions + student replies + AAC icon taps ───────────────────────
  const poll = useCallback(async () => {
    if (!token) return;
    try {
      // 1. Teacher's own broadcast captions
      const ccRes = await axios.get(
        `${API_BASE_URL}/cc/messages/?since=${lastCCIdRef.current}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ccMsgs: any[] = ccRes.data;
      if (ccMsgs.length > 0) {
        const formatted: CCLine[] = ccMsgs.map((m) => ({
          id:      m.id,
          text:    m.text,
          speaker: "teacher" as const,
          time:    m.sent_at
            ? new Date(m.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setLines((prev) => [...prev, ...formatted]);
        lastCCIdRef.current = ccMsgs[ccMsgs.length - 1].id;
      }

      // 2. AAC icon taps from the session log
      const aacRes = await axios.get(
        `${API_BASE_URL}/sessions/logs/?since=${lastAacIdRef.current}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const aacLogs: any[] = aacRes.data;
      if (aacLogs.length > 0) {
        const formatted: CCLine[] = aacLogs.map((l) => ({
          id:          `aac-${l.id}`,
          text:        l.message || l.icon_label,
          speaker:     "student" as const,
          time:        l.tapped_at
            ? new Date(l.tapped_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          studentName: l.student_name || "Student",
        }));
        setLines((prev) => [...prev, ...formatted]);
        lastAacIdRef.current = aacLogs[aacLogs.length - 1].id;
      }
    } catch { /* silent — just keep polling */ }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    poll();
    pollRef.current = setInterval(poll, POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [poll, token]);

  // ── Broadcast caption to students ─────────────────────────────────────────
  const broadcastMessage = async (textOverride?: string) => {
    const textToSend = (textOverride ?? input).trim();
    if (!textToSend || !token) return;
    setIsSending(true);
    if (!textOverride) setInput("");
    try {
      await axios.post(
        `${API_BASE_URL}/broadcast/`,
        { text: textToSend, speaker: "teacher" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await poll();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Failed to broadcast.";
      Alert.alert("Error", detail);
      if (!textOverride) setInput(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // ── End session ───────────────────────────────────────────────────────────
  const handleEndSession = () => {
    Alert.alert(
      "End Class",
      "Are you sure? This disconnects all students.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.post(
                `${API_BASE_URL}/sessions/toggle`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setActive("home");
            } catch {
              Alert.alert("Error", "Could not end session. Try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Live Class Room</Text>
            <Text style={s.headerSub}>🟢 Session active — type to broadcast</Text>
          </View>
          <TouchableOpacity onPress={handleEndSession} style={s.endBtn}>
            <Text style={s.endBtnText}>End Class</Text>
          </TouchableOpacity>
        </View>

        {/* Caption + student replies feed */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.feed}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {lines.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>Nothing yet. Type below to broadcast ↓</Text>
            </View>
          ) : (
            lines.map((line) => {
              if (line.speaker === "teacher") {
                return (
                  <View key={line.id} style={s.ccCard}>
                    <View style={s.ccTop}>
                      <Text style={s.ccSpeaker}>👨‍🏫 You</Text>
                      <Text style={s.ccTime}>{line.time}</Text>
                    </View>
                    <Text style={s.ccText}>{line.text}</Text>
                  </View>
                );
              }
              // Student reply bubble
              return (
                <View key={line.id} style={s.replyCard}>
                  <View style={s.ccTop}>
                    <Text style={s.replySpeaker}>🎓 {line.studentName || "Student"}</Text>
                    <Text style={s.ccTime}>{line.time}</Text>
                  </View>
                  <Text style={s.replyText}>{line.text}</Text>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input */}
        <View style={s.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type to broadcast…"
            placeholderTextColor={C.text3}
            multiline
            style={s.largeInput}
          />
          <TouchableOpacity
            onPress={() => broadcastMessage()}
            disabled={!input.trim() || isSending}
            style={[s.sendBtn, (!input.trim() || isSending) && s.sendBtnDisabled]}
          >
            <Text style={s.sendBtnText}>{isSending ? "…" : "Send"}</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  header:         { flexDirection: "row", alignItems: "center", padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: C.gray2, backgroundColor: C.white },
  headerTitle:    { fontSize: FontSize.lg, fontWeight: "800", color: C.text },
  headerSub:      { fontSize: FontSize.sm, color: "#047857", marginTop: 2, fontWeight: "600" },
  endBtn:         { backgroundColor: "#DC2626", paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, ...Shadow.sm },
  endBtnText:     { color: C.white, fontWeight: "800", fontSize: FontSize.sm },
  feed:           { padding: Spacing.lg, gap: 10, paddingBottom: 20 },
  emptyWrap:      { alignItems: "center", marginTop: 60 },
  emptyText:      { fontSize: FontSize.md, color: C.text3, fontStyle: "italic", textAlign: "center" },
  // Teacher caption cards
  ccCard:         { backgroundColor: C.tealLight, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: C.tealBorder, ...Shadow.sm },
  ccTop:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  ccSpeaker:      { fontSize: FontSize.xs, fontWeight: "700", color: C.teal },
  ccTime:         { fontSize: FontSize.xs, color: C.text3 },
  ccText:         { fontSize: FontSize.base, color: C.text, lineHeight: 22 },
  // Student reply cards
  replyCard:      { backgroundColor: C.purpleLight, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: C.gray2, ...Shadow.sm },
  replySpeaker:   { fontSize: FontSize.sm, fontWeight: "700", color: C.purple },
  replyText:      { fontSize: 20, color: C.text, lineHeight: 28 },
  // Input area
  inputContainer:   { flexDirection: "row", alignItems: "flex-end", padding: Spacing.md, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.gray2, gap: 8 },
  largeInput:       { flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: C.gray, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.base, color: C.text, paddingTop: 14 },
  sendBtn:          { height: 48, paddingHorizontal: 20, borderRadius: Radius.md, backgroundColor: C.teal, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled:  { backgroundColor: C.gray3 },
  sendBtnText:      { fontSize: FontSize.md, color: C.white, fontWeight: "700" },
});
