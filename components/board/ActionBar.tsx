import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors as C, FontSize, Radius, Shadow } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface ActionBarProps {
  hasSelection: boolean;
  speaking: boolean;
  sent: boolean;
  onSpeak: () => void;
  onSend: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ hasSelection, speaking, sent, onSpeak, onSend }) => {
  const { colors } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <Pressable
        onPress={onSpeak}
        disabled={!hasSelection || speaking}
        style={[s.btn, s.speakBtn, (!hasSelection || speaking) && s.disabled]}
      >
        <Text style={s.emoji}>🔊</Text>
        <Text style={s.text}>{speaking ? "Speaking..." : "Speak"}</Text>
      </Pressable>

      <Pressable
        onPress={onSend}
        disabled={!hasSelection}
        style={[s.btn, s.sendBtn, !hasSelection && s.disabled]}
      >
        <Text style={s.emoji}>{sent ? "✅" : "📤"}</Text>
        <Text style={s.text}>{sent ? "Sent!" : "Send"}</Text>
      </Pressable>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: "row", gap: 12, padding: 16,
    borderTopWidth: 1,
  },
  btn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 18, borderRadius: Radius.lg,
    minHeight: 62, ...Shadow.md,
  },
  speakBtn:  { backgroundColor: "#0F172A" },
  sendBtn:   { backgroundColor: "#1AADDC" },
  disabled:  { opacity: 0.4 },
  emoji:     { fontSize: 22 },
  text:      { fontSize: FontSize.md, fontWeight: "800", color: C.white },
});

export default ActionBar;
