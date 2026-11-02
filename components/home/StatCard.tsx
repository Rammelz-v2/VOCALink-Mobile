import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors as C, FontSize, Radius, Shadow } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface StatCardProps {
  emoji: string;
  value: string;
  label: string;
  large?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ emoji, value, label, large }) => {
  const { colors } = useTheme();
  return (
    <View style={[s.card, large && { minHeight: 100, paddingVertical: 18 }, { backgroundColor: colors.surface }]}>
      <Text style={[s.emoji, large && { fontSize: 26 }]}>{emoji}</Text>
      <Text style={[s.value, large && { fontSize: 20 }, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[s.label, large && { fontSize: FontSize.sm }, { color: colors.text3 }]}>{label}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    flex: 1, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: "#E2E8F0",
    paddingVertical: 14, paddingHorizontal: 6,
    minHeight: 84,
    alignItems: "center", justifyContent: "center", gap: 4,
    ...Shadow.sm, shadowColor: "#000",
  },
  emoji: { fontSize: 20 },
  value: { fontSize: FontSize.md, fontWeight: "800" },
  label: { fontSize: FontSize.xs, fontWeight: "600" },
});

export default StatCard;
