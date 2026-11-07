import React from "react";
import {
  Modal, View, Text, Pressable, ScrollView, StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AACCell from "./AACCell";
import type { AACIcon } from "../../constants/types";
import { FontSize, Radius } from "../../constants/tokens";

export type SheetType = "requests" | "emergency";

interface RequestSheetProps {
  visible: boolean;
  type: SheetType;
  requestIcons: AACIcon[];
  emergencyIcons: AACIcon[];
  onPress: (icon: AACIcon) => void;
  onClose: () => void;
}

const GAP  = 12;
const PAD  = 16;
const COLS = 4;

function chunk<T>(arr: T[], n: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += n) rows.push(arr.slice(i, i + n));
  return rows;
}

const CFG = {
  requests:  { title: "Need Something?", emoji: "✋" as string | null, color: "#F59E0B" },
  emergency: { title: "Emergency",        emoji: null,                  color: "#DC2626" },
};

const RequestSheet: React.FC<RequestSheetProps> = ({
  visible, type, requestIcons, emergencyIcons, onPress, onClose,
}) => {
  const { width: sw } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cfg    = CFG[type];
  const icons  = type === "requests" ? requestIcons : emergencyIcons;
  const cell   = Math.floor((sw - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const emojiSz = Math.floor(cell * 0.4);
  const rows   = chunk(icons, COLS);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.root}>
        <Pressable style={s.overlay} onPress={onClose} />
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={s.handle} />
          <View style={[s.header, { backgroundColor: cfg.color }]}>
            {cfg.emoji
              ? <Text style={s.headerEmoji}>{cfg.emoji}</Text>
              : <MaterialIcons name="warning" size={24} color="#fff" />
            }
            <Text style={s.headerTitle}>{cfg.title}</Text>
            <Pressable onPress={onClose} hitSlop={16} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: PAD, paddingBottom: PAD + 8 }}
          >
            {rows.map((row, ri) => (
              <View key={ri} style={[s.row, { gap: GAP, marginBottom: GAP }]}>
                {row.map(icon => (
                  <AACCell
                    key={icon.id}
                    icon={icon}
                    onPress={(ic) => { onPress(ic); onClose(); }}
                    size={cell}
                    emojiSize={emojiSz}
                  />
                ))}
                {row.length < COLS && Array.from({ length: COLS - row.length }).map((_, i) => (
                  <View key={i} style={{ width: cell }} />
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  root:    { flex: 1, justifyContent: "flex-end" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "78%", overflow: "hidden",
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1",
    alignSelf: "center", marginTop: 10, marginBottom: 2,
  },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerEmoji: { fontSize: 22 },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: "800", color: "#fff" },
  closeBtn:    { padding: 4 },
  closeTxt:    { fontSize: 18, fontWeight: "700", color: "#fff" },
  row:         { flexDirection: "row" },
});

export default RequestSheet;
