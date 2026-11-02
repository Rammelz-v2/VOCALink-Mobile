import React from "react";
import { StyleSheet, Text } from "react-native";

const ACCENT = "#1AADDC";

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={s.sectionTitle}>{title}</Text>
);

const s = StyleSheet.create({
  sectionTitle: {
    fontSize: 11, fontWeight: "800", color: ACCENT,
    textTransform: "uppercase", letterSpacing: 1.4,
    borderLeftWidth: 3, borderLeftColor: ACCENT,
    paddingLeft: 10, marginBottom: 18,
  },
});

export default SectionTitle;
