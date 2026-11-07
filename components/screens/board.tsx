import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { GestureDetector, Gesture, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import axios from "axios";

import { useLiveCC } from "../../contexts/LiveCCContext";
import { AAC_ICONS } from "../../constants/mockdata";
import { API_BASE_URL } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import type { AACCategory, AACIcon } from "../../constants/types";
import { ScreenHeader } from "../ui/ScreenHeader";
import { useLayout } from "../../hooks/useLayout";
import { MaterialIcons } from "@expo/vector-icons";
import AACCell from "../board/AACCell";
import MessageBuilder from "../board/MessageBuilder";
import SmartSuggestions, { Prediction } from "../board/SmartSuggestions";
import CategoryTabs, { CATEGORIES } from "../board/CategoryTabs";
import ActionBar from "../board/ActionBar";
import RequestSheet, { SheetType } from "../board/RequestSheet";

const GAP = 12;


function chunk<T>(arr: T[], n: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += n) rows.push(arr.slice(i, i + n));
  return rows;
}

const PREDICT_TOP_K = 5;

function parsePredictions(data: any): Prediction[] {
  const raw: any[] = Array.isArray(data) ? data : data?.predictions ?? [];
  const scoreList = data?.confidence ?? data?.scores;
  const scores: number[] | undefined = Array.isArray(scoreList) ? scoreList : undefined;
  const out: Prediction[] = [];
  raw.forEach((p, idx) => {
    const id = typeof p === "string" ? p : p?.icon_id ?? p?.id;
    if (!id) return;
    const icon = AAC_ICONS.find(i => i.id === id);
    if (!icon || out.some(o => o.icon.id === icon.id)) return;
    const s = typeof p === "object" ? p?.score ?? p?.probability ?? p?.confidence : scores?.[idx];
    out.push({ icon, score: typeof s === "number" && isFinite(s) ? s : undefined });
  });
  return out;
}

const REQUEST_TYPE_BY_ICON_ID: Record<string, string> = {
  // Emergencies
  medicine:      "medication",
  toilet:        "bathroom",
  emergency:     "emergency",
  hurt:          "emergency",
  stomachache:   "emergency",
  dizzy:         "emergency",
  unsafe:        "emergency",
  get_adult:     "assistance",
  headache:      "emergency",
  cant_breathe:  "emergency",
  bleeding:      "emergency",
  very_scared:   "emergency",
  being_bullied: "emergency",
  fell_down:     "emergency",
  fever:         "emergency",
  // Everyday classroom requests — each gets its own type so the teacher
  // sees a meaningful label even on requests that have no note yet.
  help:          "help",
  water:         "water",
  food:          "food",
  pencil:        "pencil",
  tissue:        "tissue",
  need_break:    "break",
  rest:          "rest",
  cold:          "cold",
  hot:           "hot",
  too_loud:      "too_loud",
  fix_chair:     "chair",
  go_outside:    "outside",
  bag:           "bag",
};

// Human-readable suffix for each request icon → "[Name] + suffix"
const REQUEST_PHRASE: Record<string, string> = {
  help:          "needs help ✋",
  water:         "wants water 💧",
  food:          "wants food 🍎",
  toilet:        "needs to use the bathroom 🚻",
  pencil:        "needs a pencil ✏️",
  tissue:        "needs a tissue 🤧",
  need_break:    "wants to take a break ⏸️",
  rest:          "needs to rest 😴",
  cold:          "is feeling cold 🥶",
  hot:           "is feeling too hot 🥵",
  too_loud:      "says it's too loud 🔇",
  fix_chair:     "needs to fix their seat 🪑",
  go_outside:    "wants to go outside 🌳",
  bag:           "needs their bag 🎒",
  medicine:      "needs medicine 💊",
  emergency:     "has an emergency 🚨",
  hurt:          "is hurt 🤕",
  stomachache:   "has a stomachache 🤢",
  dizzy:         "is feeling dizzy 😵",
  unsafe:        "doesn't feel safe ⚠️",
  get_adult:     "needs an adult 🙋",
  headache:      "has a headache 🤯",
  cant_breathe:  "can't breathe 😮‍💨",
  bleeding:      "is bleeding 🩸",
  very_scared:   "is very scared 😱",
  being_bullied: "is being bullied 😢",
  fell_down:     "fell down 🤸",
  fever:         "has a fever 🌡️",
};

// Everyday classroom requests
const REQUESTS_ICON_IDS = new Set([
  "help", "water", "food", "toilet", "pencil", "tissue",
  "need_break", "rest", "cold", "hot", "too_loud", "fix_chair", "go_outside", "bag",
]);

// Medical / emergency icons — everything in REQUEST_TYPE_BY_ICON_ID that isn't a classroom request
const EMERGENCY_ICON_IDS = new Set(
  Object.keys(REQUEST_TYPE_BY_ICON_ID).filter(id => !REQUESTS_ICON_IDS.has(id))
);

interface AACBoardProps {
  onSendToTeacher?: (message: string) => void;
  sessionCode?: string | null;
}

const AACBoard: React.FC<AACBoardProps> = ({ onSendToTeacher, sessionCode }) => {
  const { token, user }  = useAuth();
  const { colors }       = useTheme();
  const { lines }        = useLiveCC();
  const { sw: SW, aacCols: COLS, hPad: PAD, isTablet, isLandscape } = useLayout();
  const CELL     = Math.floor((SW - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const EMOJI_SZ = Math.floor(CELL * (isTablet ? 0.38 : 0.44));
  const [category, setCategory] = useState<AACCategory>("all");
  const categoryRef   = useRef<AACCategory>("all");
  const catScrollRef  = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = CATEGORIES.findIndex(c => c.id === category);
    if (idx < 0 || !catScrollRef.current) return;
    catScrollRef.current.scrollTo({ x: Math.max(0, idx * 88 - 60), animated: true });
  }, [category]);

  const dragX    = useSharedValue(0);
  const catIdxSV = useSharedValue(0);

  useEffect(() => {
    categoryRef.current = category;
    catIdxSV.value = CATEGORIES.findIndex(c => c.id === category);
    dragX.value = 0; // snap after tab-tap or post-swipe re-render
  }, [category]);

  const doSetCategory = (id: AACCategory) => {
    setCategory(id);
    Haptics.selectionAsync();
  };

  const swipeGesture = useMemo(() =>
    Gesture.Pan()
      .activeOffsetX([-20, 20])
      .failOffsetY([-15, 15])
      .onChange((e) => { dragX.value = e.translationX; })
      .onEnd((e) => {
        const dx  = e.translationX;
        const idx = catIdxSV.value;
        if (dx < -60 && idx < CATEGORIES.length - 1) {
          // Snap back, then switch — content swap is instant (no remount needed).
          dragX.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(doSetCategory)(CATEGORIES[idx + 1].id);
          });
        } else if (dx > 60 && idx > 0) {
          dragX.value = withTiming(0, { duration: 150 }, () => {
            runOnJS(doSetCategory)(CATEGORIES[idx - 1].id);
          });
        } else {
          dragX.value = withSpring(0, { damping: 20, stiffness: 250 });
        }
      }),
  []);

  const gridAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  const [selected, setSelected] = useState<AACIcon[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [sent, setSent]         = useState(false);
  const [requestSent, setRequestSent]       = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<{ id: number; note: string } | null>(null);
  const [ackFeedback,   setAckFeedback]     = useState<string | null>(null);
  const [sheetOpen,     setSheetOpen]       = useState(false);
  const [sheetType,     setSheetType]       = useState<SheetType>("requests");

  const [predictions, setPredictions]       = useState<Prediction[]>([]);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    if (!token || !sessionCode) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setPredictLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/predict-next/`,
          { sequence: selected.map(s => s.id), top_k: PREDICT_TOP_K },
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, timeout: 8000 }
        );
        const lastId = selected[selected.length - 1]?.id;
        setPredictions(
          parsePredictions(res.data).filter(p => p.icon.id !== lastId).slice(0, PREDICT_TOP_K)
        );
      } catch (err) {
        if (!axios.isCancel(err)) setPredictions([]);
      } finally {
        if (!controller.signal.aborted) setPredictLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [selected, token, sessionCode]);

  // Watch the Live CC feed for an acknowledgment broadcast sent by the teacher on acknowledge.
  const prevLinesLenRef = useRef(lines.length);
  useEffect(() => {
    const newLines = lines.slice(prevLinesLenRef.current);
    prevLinesLenRef.current = lines.length;
    if (!pendingRequest || !newLines.length) return;
    const ack = newLines.find(l => l.speaker === "teacher" && l.text.includes("[ACK]"));
    if (ack) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAckFeedback("Your teacher acknowledged your request");
      setPendingRequest(null);
      setTimeout(() => setAckFeedback(null), 5000);
    }
  }, [lines, pendingRequest]);

  // Pre-compute rows for every category once — switching becomes a style-only change.
  const allRows = useMemo(() => {
    const filter = (cat: AACCategory): AACIcon[] =>
      cat === "all"      ? AAC_ICONS.filter(i => !REQUESTS_ICON_IDS.has(i.id) && !EMERGENCY_ICON_IDS.has(i.id)) :
      cat === "requests" ? AAC_ICONS.filter(i => REQUESTS_ICON_IDS.has(i.id)) :
      cat === "emergency"? AAC_ICONS.filter(i => EMERGENCY_ICON_IDS.has(i.id)) :
                           AAC_ICONS.filter(i => i.category === cat);
    const result: Record<string, AACIcon[][]> = {};
    CATEGORIES.forEach(cat => { result[cat.id] = chunk(filter(cat.id as AACCategory), COLS); });
    return result;
  }, [COLS]);
  const requestIcons   = useMemo(() => AAC_ICONS.filter(i => REQUESTS_ICON_IDS.has(i.id)),  []);
  const emergencyIcons = useMemo(() => AAC_ICONS.filter(i => EMERGENCY_ICON_IDS.has(i.id)), []);

  const messageText = selected.map(i => i.label).join(" ");

  const handleIconPress = useCallback((icon: AACIcon) => {
    const requestType = REQUEST_TYPE_BY_ICON_ID[icon.id];

    if (requestType) {
      const name   = user?.first_name || user?.username || "Student";
      const phrase = REQUEST_PHRASE[icon.id] ?? `wants ${icon.label.toLowerCase()}`;
      const note   = `${name} ${phrase}`;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      axios.post(
        `${API_BASE_URL}/requests/`,
        { request_type: requestType, note, session_code: sessionCode ?? undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((res) => {
        setRequestSent(note);
        setPendingRequest({ id: res.data.id, note });
        setTimeout(() => setRequestSent(null), 3000);
      }).catch(() => {
        setRequestSent(`${note} — not sent, try again`);
        setTimeout(() => setRequestSent(null), 3000);
      });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(prev => [...prev, icon]);
  }, [user, token, sessionCode]);

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
    if (!selected.length || sent) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSendToTeacher?.(messageText);

    const headers = { Authorization: `Bearer ${token}` };
    axios.post(`${API_BASE_URL}/logs/`,
      {
        icon_id: "message",
        icon_label: messageText,
        message: messageText,
        icon_sequence: selected.map(i => i.id),
        session_code: sessionCode ?? undefined,
      },
      { headers }
    ).catch(() => {});

    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); }, 2000);
  };

  if (!sessionCode) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right", "bottom"]}>
        <ScreenHeader title="AAC Board" subtitle="Waiting for session..." />
        <View style={s.noSessionWrap}>
          <Text style={s.noSessionEmoji}>⏳</Text>
          <Text style={[s.noSessionTitle, { color: colors.text }]}>No Active Session</Text>
          <Text style={[s.noSessionSub, { color: colors.text3 }]}>
            Wait for your teacher to start a session.{"\n"}
            The board will unlock automatically.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right", "bottom"]}>

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

      {requestSent && (
        <View style={s.requestToast}>
          <Text style={s.requestToastText}>{requestSent}</Text>
        </View>
      )}

      {ackFeedback && (
        <View style={s.ackToast}>
          <Text style={s.ackToastText}>{ackFeedback}</Text>
        </View>
      )}

      <MessageBuilder
        selected={selected}
        onRemove={(idx) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelected(prev => prev.filter((_, i) => i !== idx));
        }}
      />

      <SmartSuggestions
        predictions={predictions}
        predictLoading={predictLoading}
        onPress={handleIconPress}
      />

      <CategoryTabs
        category={category}
        setCategory={setCategory}
        isTablet={isTablet}
        hPad={PAD}
        catScrollRef={catScrollRef}
      />

      <GestureDetector gesture={swipeGesture}>
        {/* All categories are pre-rendered and kept mounted.
            Inactive pages collapse to height:0 so switching is a style-only change — no remount lag. */}
        <Animated.View style={[s.gridOuter, gridAnimStyle]}>
          {CATEGORIES.map(cat => (
            <View
              key={cat.id}
              style={cat.id === category ? s.pageActive : s.pageHidden}
              pointerEvents={cat.id === category ? "auto" : "none"}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[s.grid, { padding: PAD, paddingBottom: 20 }]}
                style={{ flex: 1 }}
              >
                {(allRows[cat.id] ?? []).map((row, ri) => (
                  <View key={ri} style={s.row}>
                    {row.map(icon => (
                      <AACCell
                        key={icon.id}
                        icon={icon}
                        onPress={handleIconPress}
                        size={CELL}
                        emojiSize={EMOJI_SZ}
                      />
                    ))}
                    {row.length < COLS && Array.from({ length: COLS - row.length }).map((_, i) => (
                      <View key={i} style={{ width: CELL }} />
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </Animated.View>
      </GestureDetector>

      {/* Request / Emergency quick-access bar */}
      <View style={s.requestBar}>
        <TouchableOpacity
          style={[s.sheetBtn, s.requestSheetBtn]}
          onPress={() => { setSheetType("requests"); setSheetOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
          disabled={!sessionCode}
          activeOpacity={0.8}
        >
          <Text style={s.sheetBtnEmoji}>✋</Text>
          <Text style={[s.sheetBtnLabel, { color: "#92400E" }]}>Need Something?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.sheetBtn, s.emergencySheetBtn]}
          onPress={() => { setSheetType("emergency"); setSheetOpen(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); }}
          disabled={!sessionCode}
          activeOpacity={0.8}
        >
          <MaterialIcons name="warning" size={22} color="#991B1B" />
          <Text style={[s.sheetBtnLabel, { color: "#991B1B" }]}>Emergency</Text>
        </TouchableOpacity>
      </View>

      <ActionBar
        hasSelection={selected.length > 0}
        speaking={speaking}
        sent={sent}
        onSpeak={handleSpeak}
        onSend={handleSend}
      />

      <RequestSheet
        visible={sheetOpen}
        type={sheetType}
        requestIcons={requestIcons}
        emergencyIcons={emergencyIcons}
        onPress={handleIconPress}
        onClose={() => setSheetOpen(false)}
      />

    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  noSessionWrap: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 40,
  },
  noSessionEmoji: { fontSize: 64, marginBottom: 20 },
  noSessionTitle: {
    fontSize: FontSize.xl, fontWeight: "800",
    textAlign: "center", marginBottom: 12, letterSpacing: -0.5,
  },
  noSessionSub: {
    fontSize: FontSize.base, textAlign: "center",
    lineHeight: 24, fontWeight: "500",
  },

  clearBtn: {
    backgroundColor: C.redLight, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: "#FCA5A5",
  },
  clearBtnText: { fontSize: FontSize.sm, color: C.redDark, fontWeight: "700" },

  requestToast: {
    marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: Radius.md,
    backgroundColor: "#FDECEC", borderWidth: 1.5, borderColor: "#FCA5A5",
    alignItems: "center",
  },
  requestToastText: { fontSize: FontSize.sm, fontWeight: "700", color: "#B91C1C" },

  ackToast: {
    marginHorizontal: 16, marginTop: 6, padding: 12, borderRadius: Radius.md,
    backgroundColor: "#DCFCE7", borderWidth: 1.5, borderColor: "#86EFAC",
    alignItems: "center",
  },
  ackToastText: { fontSize: FontSize.sm, fontWeight: "700", color: "#15803D" },

  requestBar: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2,
  },
  sheetBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: Radius.lg, borderWidth: 1.5,
  },
  requestSheetBtn:   { backgroundColor: "#FFFBEB", borderColor: "#FCD34D" },
  emergencySheetBtn: { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" },
  sheetBtnEmoji: { fontSize: 20 },
  sheetBtnLabel: { fontSize: FontSize.sm, fontWeight: "700" },

  gridOuter:  { flex: 1, overflow: 'hidden' },
  pageActive: { flex: 1 },
  pageHidden: { height: 0, overflow: 'hidden' },
  grid: { padding: 16, paddingBottom: 20 },
  row: { flexDirection: "row", gap: 14, marginBottom: 14 },
});

export default AACBoard;
