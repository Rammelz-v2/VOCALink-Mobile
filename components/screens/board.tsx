import React, { useEffect, useState } from "react";
import {
  ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import axios from "axios";

import { AAC_ICONS } from "../../constants/mockdata";
import { API_BASE_URL } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import type { AACCategory, AACIcon } from "../../constants/types";
import { ScreenHeader } from "../ui/ScreenHeader";

const PAD  = 16;
const GAP  = 14;
const COLS = 3;

// Chunk array into rows of N
function chunk<T>(arr: T[], n: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += n) rows.push(arr.slice(i, i + n));
  return rows;
}

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES: { id: AACCategory; label: string; emoji: string; color: string }[] = [
  { id: "all",       label: "All",      emoji: "📋", color: "#475569" },
  { id: "needs",     label: "Needs",    emoji: "💧", color: "#0EA5E9" },
  { id: "emotions",  label: "Feelings", emoji: "😊", color: "#EC4899" },
  { id: "classroom", label: "Class",    emoji: "📖", color: "#8B5CF6" },
  { id: "actions",   label: "Actions",  emoji: "✅", color: "#22C55E" },
];

interface AACBoardProps {
  onSendToTeacher?: (message: string) => void;
  sessionCode?: string | null;
}

const AACBoard: React.FC<AACBoardProps> = ({ onSendToTeacher, sessionCode }) => {
  const { token, user } = useAuth();
  const { width: SW } = useWindowDimensions();
  const CELL     = Math.floor((SW - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const EMOJI_SZ = Math.floor(CELL * 0.40);
  const [category, setCategory] = useState<AACCategory>("all");
  const [selected, setSelected] = useState<AACIcon[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [sent, setSent]         = useState(false);

  // ── LSTM-style next-icon prediction ───────────────────────────────────────
  const [predictions, setPredictions]       = useState<AACIcon[]>([]);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchPredictions = async () => {
      setPredictLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/predict-next/`,
          { sequence: selected.map(s => s.id), top_k: 3 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelled) return;
        const ids: string[] = res.data?.predictions || [];
        const mapped = ids
          .map(id => AAC_ICONS.find(i => i.id === id))
          .filter((x): x is AACIcon => !!x);
        setPredictions(mapped);
      } catch {
        if (!cancelled) setPredictions([]);
      } finally {
        if (!cancelled) setPredictLoading(false);
      }
    };
    fetchPredictions();
    return () => { cancelled = true; };
  }, [selected, token]);

  const filtered = category === "all"
    ? AAC_ICONS
    : AAC_ICONS.filter(i => i.category === category);

  const rows = chunk(filtered, COLS);
  const messageText = selected.map(i => i.label).join(" ");

  // Tapping an icon only builds the message locally — nothing is sent to
  // the backend (and therefore nothing appears on the teacher's screen)
  // until the student taps Send.
  const handleIconPress = (icon: AACIcon) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(prev => [...prev, icon]);
  };

  const handleSpeak = () => {
    if (!selected.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSpeaking(true);
    Speech.speak(messageText, {
      language: "en", pitch: 1.0, rate: 0.85,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const handleSend = () => {
    if (!selected.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSendToTeacher?.(messageText);

    const headers = { Authorization: `Bearer ${token}` };

    // Log the whole built message as a single entry — this is the only
    // network call the AAC board makes per message, and it only fires
    // once the student has tapped Send.
    axios.post(`${API_BASE_URL}/logs/`,
      { icon_id: "message", icon_label: messageText, message: messageText },
      { headers }
    ).catch(() => {});

    // Also log to the active session, if one is running, so the teacher's
    // session history shows the complete message rather than individual
    // icon taps.
    if (sessionCode) {
      axios.post(`${API_BASE_URL}/sessions/log/`,
        { session_code: sessionCode, icon_id: "message", icon_label: messageText },
        { headers }
      ).catch(() => {});
    }

    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); }, 2000);
  };

  // ── No session → show waiting screen ────────────────────────────────────
  if (!sessionCode) {
    return (
      <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
        <ScreenHeader title="AAC Board" subtitle="Waiting for session..." />
        <View style={s.noSessionWrap}>
          <Text style={s.noSessionEmoji}>⏳</Text>
          <Text style={s.noSessionTitle}>No Active Session</Text>
          <Text style={s.noSessionSub}>
            Wait for your teacher to start a session.{"\n"}
            The board will unlock automatically.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>

      {/* ── Header ── */}
      <ScreenHeader
        title="AAC Board"
        subtitle="🔴 Session Live — teacher is watching"
        right={selected.length > 0 ? (
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setSelected([]); }}
            style={s.clearBtn}
          >
            <Text style={s.clearBtnText}>✕ Clear</Text>
          </TouchableOpacity>
        ) : undefined}
      />

      {/* ── Message builder ── */}
      <View style={s.builder}>
        {selected.length === 0 ? (
          <View style={s.builderEmpty}>
            <Text style={s.builderEmptyEmoji}>👆</Text>
            <Text style={s.builderEmptyText}>Tap icons to build your message</Text>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
              {selected.map((icon, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelected(prev => prev.filter((_, idx) => idx !== i));
                  }}
                  style={s.chip}
                  activeOpacity={0.7}
                >
                  <Text style={s.chipEmoji}>{icon.emoji}</Text>
                  <Text style={s.chipLabel}>{icon.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.messagePreview} numberOfLines={1}>"{messageText}"</Text>
          </>
        )}
      </View>

      {/* ── LSTM Smart Suggestions ── */}
      {predictions.length > 0 && (
        <View style={s.predictWrap}>
          <View style={s.predictHeader}>
            <Text style={s.predictTitle}>✨ Suggested Next</Text>
            <Text style={s.predictBadge}>LSTM</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.predictRow}
          >
            {predictions.map(icon => (
              <TouchableOpacity
                key={`pred-${icon.id}`}
                onPress={() => handleIconPress(icon)}
                activeOpacity={0.75}
                style={[s.predictChip, { backgroundColor: icon.bg }]}
              >
                <Text style={s.predictEmoji}>{icon.emoji}</Text>
                <Text style={s.predictLabel} numberOfLines={1}>{icon.label}</Text>
              </TouchableOpacity>
            ))}
            {predictLoading && (
              <View style={[s.predictChip, { backgroundColor: "#F1F5F9" }]}>
                <Text style={s.predictEmoji}>⏳</Text>
                <Text style={s.predictLabel}>...</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* ── Category tabs ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catRow} style={s.catWrap}
      >
        {CATEGORIES.map(cat => {
          const active = category === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => { Haptics.selectionAsync(); setCategory(cat.id); }}
              activeOpacity={0.8}
              style={[s.catTab, active && { backgroundColor: cat.color, borderColor: cat.color }]}
            >
              <Text style={s.catEmoji}>{cat.emoji}</Text>
              <Text style={[s.catLabel, active && s.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Icon grid — manual rows for perfect alignment ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map(icon => (
              <TouchableOpacity
                key={icon.id}
                onPress={() => handleIconPress(icon)}
                activeOpacity={0.75}
                style={[s.cellBase, { width: CELL, height: CELL + 30, backgroundColor: icon.bg }]}
              >
                <Text style={{ fontSize: EMOJI_SZ }}>{icon.emoji}</Text>
                <Text style={[s.cellLabel, { width: CELL - 8 }]} numberOfLines={1}>{icon.label}</Text>
              </TouchableOpacity>
            ))}
            {row.length < COLS && Array.from({ length: COLS - row.length }).map((_, i) => (
              <View key={`empty-${i}`} style={{ width: CELL }} />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* ── Action buttons ── */}
      <View style={s.actions}>
        <TouchableOpacity
          onPress={handleSpeak}
          disabled={!selected.length || speaking}
          activeOpacity={0.85}
          style={[s.actionBtn, s.speakBtn, (!selected.length || speaking) && s.btnDisabled]}
        >
          <Text style={s.actionEmoji}>🔊</Text>
          <Text style={s.actionText}>{speaking ? "Speaking..." : "Speak"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!selected.length}
          activeOpacity={0.85}
          style={[s.actionBtn, s.sendBtn, !selected.length && s.btnDisabled]}
        >
          <Text style={s.actionEmoji}>{sent ? "✅" : "📤"}</Text>
          <Text style={s.actionText}>{sent ? "Sent!" : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // No session
  noSessionWrap: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 40,
  },
  noSessionEmoji: { fontSize: 64, marginBottom: 20 },
  noSessionTitle: {
    fontSize: FontSize.xl, fontWeight: "800", color: C.text,
    textAlign: "center", marginBottom: 12, letterSpacing: -0.5,
  },
  noSessionSub: {
    fontSize: FontSize.base, color: C.text3, textAlign: "center",
    lineHeight: 24, fontWeight: "500",
  },

  // Header
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: PAD, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.gray2,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: "800", color: C.text },
  clearBtn: {
    backgroundColor: C.redLight, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: "#FCA5A5",
  },
  clearBtnText: { fontSize: FontSize.sm, color: C.redDark, fontWeight: "700" },

  // Builder
  builder: {
    marginHorizontal: PAD, marginVertical: 10,
    minHeight: 88, backgroundColor: C.white,
    borderRadius: Radius.lg, borderWidth: 2, borderColor: C.gray2,
    padding: 12, justifyContent: "center", ...Shadow.sm,
  },
  builderEmpty: { alignItems: "center", gap: 4 },
  builderEmptyEmoji: { fontSize: 26 },
  builderEmptyText: { fontSize: FontSize.sm, color: C.text3, fontWeight: "500" },
  chipRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  chip: {
    backgroundColor: C.purpleLight, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: "center", gap: 4,
    borderWidth: 1.5, borderColor: C.purpleMid, minWidth: 56,
  },
  chipEmoji: { fontSize: 22 },
  chipLabel: { fontSize: FontSize.xs, color: C.purple, fontWeight: "700" },
  messagePreview: {
    marginTop: 6, fontSize: FontSize.sm,
    color: C.text2, fontWeight: "600", fontStyle: "italic",
  },

  // LSTM Predictions
  predictWrap: {
    marginHorizontal: PAD, marginTop: 4, marginBottom: 6,
    backgroundColor: "#FAF5FF", borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: "#E9D5FF",
    padding: 10, ...Shadow.sm,
  },
  predictHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 8, paddingHorizontal: 2,
  },
  predictTitle: { fontSize: FontSize.sm, fontWeight: "800", color: "#7C3AED" },
  predictBadge: {
    fontSize: 10, fontWeight: "900", color: "#fff",
    backgroundColor: "#7C3AED", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, overflow: "hidden", letterSpacing: 0.5,
  },
  predictRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  predictChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.06)",
    minHeight: 44,
  },
  predictEmoji: { fontSize: 22 },
  predictLabel: { fontSize: FontSize.sm, fontWeight: "700", color: C.text },

  // Category
  catWrap: { maxHeight: 58, flexGrow: 0 },
  catRow: { paddingHorizontal: PAD, gap: 8, alignItems: "center", paddingVertical: 8 },
  catTab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.full, borderWidth: 2, borderColor: C.gray2,
    backgroundColor: C.white, minHeight: 44,
  },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: FontSize.sm, color: C.text2, fontWeight: "600" },
  catLabelActive: { color: C.white, fontWeight: "700" },

  // Grid — cell dimensions are computed inline using CELL/EMOJI_SZ from useWindowDimensions
  grid: { padding: PAD, paddingBottom: 20 },
  row: { flexDirection: "row", gap: 14, marginBottom: 14 },
  cellBase: {
    borderRadius: Radius.xl, alignItems: "center", justifyContent: "center",
    gap: 10, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.06)",
    paddingVertical: 14, paddingHorizontal: 8, ...Shadow.sm,
  },
  cellLabel: {
    fontSize: FontSize.sm, fontWeight: "700", color: C.text,
    textAlign: "center", paddingHorizontal: 6,
  },

  // Actions
  actions: {
    flexDirection: "row", gap: 12, padding: PAD,
    borderTopWidth: 1, borderTopColor: C.gray2, backgroundColor: C.white,
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 18, borderRadius: Radius.lg,
    minHeight: 62, ...Shadow.md,
  },
  speakBtn:   { backgroundColor: "#0F172A" },
  sendBtn:    { backgroundColor: C.teal    },
  btnDisabled:{ opacity: 0.4               },
  actionEmoji:{ fontSize: 22               },
  actionText: { fontSize: FontSize.md, fontWeight: "800", color: C.white },
});

export default AACBoard;