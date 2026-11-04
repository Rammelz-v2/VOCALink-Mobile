import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface LockedFieldProps {
  icon: string;
  label: string;
  value: string;
}

const LockedField: React.FC<LockedFieldProps> = ({ icon, label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={s.lockedRow}>
      <View style={[s.lockedIconBox, { backgroundColor: colors.purpleLight }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.lockedLabel, { color: colors.text3 }]}>{label}</Text>
        <Text style={[s.lockedValue, { color: colors.text }]} numberOfLines={1}>{value || "—"}</Text>
      </View>
      <Text style={s.lockIcon}>🔒</Text>
    </View>
  );
};

const s = StyleSheet.create({
  lockedRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  lockedIconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  lockedLabel: {
    fontSize: 10, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3,
  },
  lockedValue: { fontSize: 15, fontWeight: "700" },
  lockIcon:    { fontSize: 13, opacity: 0.35 },
});

export default LockedField;
