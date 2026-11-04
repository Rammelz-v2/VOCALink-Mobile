import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface FieldProps {
  label: string;
  icon: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, children }) => {
  const { colors } = useTheme();
  return (
    <View style={s.field}>
      <View style={s.fieldLabelRow}>
        <Text style={s.fieldIcon}>{icon}</Text>
        <Text style={[s.fieldLabel, { color: colors.text2 }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
};

const s = StyleSheet.create({
  field:         { marginBottom: 14 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 7 },
  fieldIcon:     { fontSize: 14 },
  fieldLabel:    { fontSize: 13, fontWeight: "700" },
});

export default Field;
