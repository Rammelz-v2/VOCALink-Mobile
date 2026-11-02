import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { FontSize, Radius, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface ThemeToggleRowProps {
  isDark: boolean;
  onToggle: () => void;
}

const ThemeToggleRow: React.FC<ThemeToggleRowProps> = ({ isDark, onToggle }) => {
  const { colors } = useTheme();
  return (
    <View style={[s.themeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={s.themeLeft}>
        <Text style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</Text>
        <View>
          <Text style={[s.themeLabel, { color: colors.text }]}>Dark Mode</Text>
          <Text style={[s.themeSub, { color: colors.text3 }]}>{isDark ? "On" : "Off"}</Text>
        </View>
      </View>
      <Switch
        value={isDark}
        onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(); }}
        trackColor={{ false: "#E2E8F0", true: "rgba(26,173,220,0.4)" }}
        thumbColor={isDark ? "#1AADDC" : "#94A3B8"}
      />
    </View>
  );
};

const s = StyleSheet.create({
  themeRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: Radius.lg, borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  themeLeft:  { flexDirection: "row", alignItems: "center", gap: 12 },
  themeLabel: { fontSize: FontSize.md, fontWeight: "700" },
  themeSub:   { fontSize: FontSize.xs, fontWeight: "500", marginTop: 2 },
});

export default ThemeToggleRow;
