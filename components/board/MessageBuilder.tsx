import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors as C, FontSize, Radius, Shadow } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import type { AACIcon } from "../../constants/types";

interface MessageBuilderProps {
  selected: AACIcon[];
  onRemove: (idx: number) => void;
}

const MessageBuilder: React.FC<MessageBuilderProps> = ({ selected, onRemove }) => {
  const { colors } = useTheme();
  const messageText = selected.map(i => i.label).join(" ");

  return (
    <View style={[s.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {selected.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>👆</Text>
          <Text style={[s.emptyText, { color: colors.text3 }]}>Tap icons to build your message</Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {selected.map((icon, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRemove(i); }}
                style={s.chip}
                activeOpacity={0.7}
              >
                <Text style={s.chipEmoji}>{icon.emoji}</Text>
                <Text style={s.chipLabel}>{icon.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[s.preview, { color: colors.text2 }]} numberOfLines={1}>"{messageText}"</Text>
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    marginHorizontal: 16, marginVertical: 10,
    minHeight: 88,
    borderRadius: Radius.lg, borderWidth: 2,
    padding: 12, justifyContent: "center", ...Shadow.sm,
  },
  empty:      { alignItems: "center", gap: 4 },
  emptyEmoji: { fontSize: 26 },
  emptyText:  { fontSize: FontSize.sm, color: C.text3, fontWeight: "500" },
  chipRow:    { flexDirection: "row", gap: 8, alignItems: "center" },
  chip: {
    backgroundColor: C.purpleLight, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: "center", gap: 4,
    borderWidth: 1.5, borderColor: C.purpleMid, minWidth: 56,
  },
  chipEmoji: { fontSize: 22 },
  chipLabel: { fontSize: FontSize.xs, color: C.purple, fontWeight: "700" },
  preview: {
    marginTop: 6, fontSize: FontSize.sm,
    fontWeight: "600", fontStyle: "italic",
  },
});

export default MessageBuilder;
