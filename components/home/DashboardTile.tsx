import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface DashboardTileProps {
  emoji: string;
  label: string;
  sub: string;
  color: string;
  bg: string;
  onPress: () => void;
  large?: boolean;
}

const DashboardTile: React.FC<DashboardTileProps> = ({ emoji, label, sub, color, bg, onPress, large }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      activeOpacity={0.85}
      style={[s.tile, { backgroundColor: bg }]}
    >
      <View style={[s.iconWrap, { backgroundColor: color }, large && { width: 56, height: 56, borderRadius: 16 }]}>
        <Text style={[s.emoji, large && { fontSize: 30 }]}>{emoji}</Text>
      </View>
      <Text style={[s.label, large && { fontSize: FontSize.lg }, { color: colors.text }]}>{label}</Text>
      <Text style={[s.sub, large && { fontSize: FontSize.sm }, { color: colors.text3 }]}>{sub}</Text>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  tile: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: 10, ...Shadow.sm,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: "center", justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  label: { fontSize: FontSize.md, fontWeight: "800" },
  sub:   { fontSize: FontSize.xs, fontWeight: "500" },
});

export default DashboardTile;
