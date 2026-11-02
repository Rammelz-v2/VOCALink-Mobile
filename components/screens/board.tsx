import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { GestureDetector, Gesture, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, SlideInLeft, SlideInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import axios from "axios";

import { AAC_ICONS } from "../../constants/mockdata";
import { API_BASE_URL } from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import type { AACCategory, AACIcon } from "../../constants/types";
import { ScreenHeader } from "../ui/ScreenHeader";
import { useLayout } from "../../hooks/useLayout";
import AACCell from "../board/AACCell";
import MessageBuilder from "../board/MessageBuilder";
import SmartSuggestions, { Prediction } from "../board/SmartSuggestions";
import CategoryTabs, { CATEGORIES } from "../board/CategoryTabs";
import ActionBar from "../board/ActionBar";

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
  medicine: "medication",
  toilet: "bathroom",
  emergency: "emergency",
  hurt: "emergency",
  stomachache: "emergency",
  dizzy: "emergency",
  unsafe: "emergency",
  get_adult: "assistance",
  headache: "emergency",
  cant_breathe: "emergency",
  bleeding: "emergency",
  very_scared: "emergency",
  being_bullied: "emergency",
  fell_down: "emergency",
  fever: "emergency",
};

interface AACBoardProps {
  onSendToTeacher?: (message: string) => void;
  sessionCode?: string | null;
}

const AACBoard: React.FC<AACBoardProps> = ({ onSendToTeacher, sessionCode }) => {
  const { token, user } = useAuth();
  const { colors }      = useTheme();
  const { sw: SW, aacCols: COLS, hPad: PAD, isTablet, isLandscape } = useLayout();
  const CELL     = Math.floor((SW - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const EMOJI_SZ = Math.floor(CELL * (isTablet ? 0.38 : 0.44));
  const [category, setCategory] = useState<AACCategory>("all");
  const categoryRef   = useRef<AACCategory>("all");
  const catScrollRef  = useRef<ScrollView>(null);
  useEffect(() => { categoryRef.current = category; }, [category]);

  useEffect(() => {
    const idx = CATEGORIES.findIndex(c => c.id === category);
    if (idx < 0 || !catScrollRef.current) return;
    catScrollRef.current.scrollTo({ x: Math.max(0, idx * 88 - 60), animated: true });
  }, [category]);

  const [swipeDir, setSwipeDir] = useState<'left' | 'right'>('left');

  const swipeGesture = useMemo(() =>
    Gesture.Pan()
      .activeOffsetX([-25, 25])
      .failOffsetY([-15, 15])
      .runOnJS(true)
      .onEnd((e) => {
        if (Math.abs(e.translationX) < 60) return;
        const idx = CATEGORIES.findIndex(c => c.id === categoryRef.current);
        if (e.translationX < 0 && idx < CATEGORIES.length - 1) {
          setSwipeDir('left');
          setCategory(CATEGORIES[idx + 1].id);
          Haptics.selectionAsync();
        } else if (e.translationX > 0 && idx > 0) {
          setSwipeDir('right');
          setCategory(CATEGORIES[idx - 1].id);
          Haptics.selectionAsync();
        }
      }),
  []);
  const [selected, setSelected] = useState<AACIcon[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [sent, setSent]         = useState(false);
  const [requestSent, setRequestSent] = useState<string | null>(null);

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

  const filtered = category === "all"
    ? AAC_ICONS
    : AAC_ICONS.filter(i => i.category === category);

  const rows = chunk(filtered, COLS);
  const messageText = selected.map(i => i.label).join(" ");

  const handleIconPress = (icon: AACIcon) => {
    const requestType = REQUEST_TYPE_BY_ICON_ID[icon.id];

    if (requestType) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      axios.post(
        `${API_BASE_URL}/requests/`,
        { request_type: requestType, note: `${icon.emoji} ${icon.label}`, session_code: sessionCode ?? undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(() => {
        setRequestSent(icon.label);
        setTimeout(() => setRequestSent(null), 2500);
      }).catch(() => {
        setRequestSent(`${icon.label} — not sent, try again`);
        setTimeout(() => setRequestSent(null), 2500);
      });
      return;
    }

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
          <Text style={s.requestToastText}>✋ {requestSent}</Text>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.grid, { padding: PAD, paddingBottom: 20 }]}
          style={{ flex: 1, overflow: 'hidden' }}
        >
          <Animated.View
            key={category}
            entering={swipeDir === 'left' ? SlideInRight.duration(220) : SlideInLeft.duration(220)}
          >
            {rows.map((row, ri) => (
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
                  <View key={`empty-${i}`} style={{ width: CELL }} />
                ))}
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </GestureDetector>

      <ActionBar
        hasSelection={selected.length > 0}
        speaking={speaking}
        sent={sent}
        onSpeak={handleSpeak}
        onSend={handleSend}
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

  grid: { padding: 16, paddingBottom: 20 },
  row: { flexDirection: "row", gap: 14, marginBottom: 14 },
});

export default AACBoard;
