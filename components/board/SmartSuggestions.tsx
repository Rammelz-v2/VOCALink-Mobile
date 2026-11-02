import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors as C, FontSize, Radius, Shadow } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import type { AACIcon } from "../../constants/types";

export interface Prediction {
  icon: AACIcon;
  score?: number;
}

interface SmartSuggestionsProps {
  predictions: Prediction[];
  predictLoading: boolean;
  onPress: (icon: AACIcon) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ predictions, predictLoading, onPress }) => {
  const { colors } = useTheme();

  if (predictions.length === 0 && !predictLoading) return null;

  return (
    <View style={[s.wrap, { backgroundColor: colors.tealLight, borderColor: "rgba(26,173,220,0.18)" }]}>
      <View style={s.header}>
        <Text style={s.title}>✨ Suggested Next</Text>
        <Text style={s.badge}>LSTM</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
      >
        {predictions.filter(p => p.icon).map(({ icon, score }) => (
          <TouchableOpacity
            key={`pred-${icon.id}`}
            onPress={() => onPress(icon)}
            activeOpacity={0.75}
            style={[s.chip, { backgroundColor: icon.bg ?? "#F1F5F9", opacity: predictLoading ? 0.6 : 1 }]}
          >
            <Text style={s.emoji}>{icon.emoji}</Text>
            <Text style={s.label} numberOfLines={1}>{icon.label}</Text>
            {score !== undefined && (
              <Text style={s.score}>{Math.round(score * 100)}%</Text>
            )}
          </TouchableOpacity>
        ))}
        {predictLoading && (
          <View style={[s.chip, { backgroundColor: "#F1F5F9" }]}>
            <Text style={s.emoji}>⏳</Text>
            <Text style={s.label}>...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 6,
    borderRadius: Radius.lg, borderWidth: 1.5,
    padding: 10, ...Shadow.sm,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 8, paddingHorizontal: 2,
  },
  title: { fontSize: FontSize.sm, fontWeight: "800", color: "#1AADDC" },
  badge: {
    fontSize: 10, fontWeight: "900", color: "#fff",
    backgroundColor: "#1AADDC", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, overflow: "hidden", letterSpacing: 0.5,
  },
  row:   { flexDirection: "row", gap: 8, alignItems: "center" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.06)",
    minHeight: 44,
  },
  emoji: { fontSize: 22 },
  label: { fontSize: FontSize.sm, fontWeight: "700", color: C.text },
  score: { fontSize: 11, fontWeight: "800", color: "#1AADDC" },
});

export default SmartSuggestions;
