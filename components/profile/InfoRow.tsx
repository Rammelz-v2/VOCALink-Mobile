import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface InfoRowProps {
  icon: string;
  label: string;
  value?: string | null;
  last?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, last }) => {
  const { colors } = useTheme();
  return (
    <View style={[s.infoRow, !last && { ...s.infoRowBorder, borderBottomColor: colors.borderSubtle }]}>
      <View style={[s.infoIconBox, { backgroundColor: colors.bg }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.infoLabel, { color: colors.text3 }]}>{label}</Text>
        <Text style={[s.infoValue, { color: colors.text }]} numberOfLines={2}>{value || "Not set"}</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  infoRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  infoRowBorder:  { borderBottomWidth: 1 },
  infoIconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  infoLabel:  { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  infoValue:  { fontSize: 14, fontWeight: "700" },
});

export default InfoRow;
