import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface LockedFieldProps {
  icon: string;
  label: string;
  value: string;
}

const LockedField: React.FC<LockedFieldProps> = ({ icon, label, value }) => (
  <View style={s.lockedRow}>
    <View style={s.lockedIconBox}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.lockedLabel}>{label}</Text>
      <Text style={s.lockedValue} numberOfLines={1}>{value || "—"}</Text>
    </View>
    <Text style={s.lockIcon}>🔒</Text>
  </View>
);

const s = StyleSheet.create({
  lockedRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  lockedIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#EEEDFE",
    alignItems: "center", justifyContent: "center",
  },
  lockedLabel: {
    fontSize: 10, fontWeight: "700", color: "#94A3B8",
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3,
  },
  lockedValue: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  lockIcon:    { fontSize: 13, opacity: 0.35 },
});

export default LockedField;
