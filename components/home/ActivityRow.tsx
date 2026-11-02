import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSize, Radius, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface ActivityRowProps {
  emoji: string;
  text: string;
  time: string;
}

const ActivityRow: React.FC<ActivityRowProps> = ({ emoji, text, time }) => {
  const { colors } = useTheme();
  return (
    <View style={[s.row, { borderBottomColor: colors.borderSubtle }]}>
      <View style={[s.iconWrap, { backgroundColor: colors.borderSubtle }]}>
        <Text style={s.icon}>{emoji}</Text>
      </View>
      <Text style={[s.text, { color: colors.text }]} numberOfLines={1}>{text}</Text>
      <Text style={[s.time, { color: colors.text3 }]}>{time}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: Spacing.md, borderBottomWidth: 1,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: Radius.md,
    alignItems: "center", justifyContent: "center",
  },
  icon: { fontSize: 16 },
  text: { flex: 1, fontSize: FontSize.sm, fontWeight: "600" },
  time: { fontSize: FontSize.xs, fontWeight: "500" },
});

export default ActivityRow;
