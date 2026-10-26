import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors as C, FontSize, Spacing } from "../../constants/tokens";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, right }) => (
  <View style={styles.header}>
    <View style={styles.accentBar} />
    <View style={styles.inner}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2D226A",
    overflow: "hidden",
  },
  accentBar: {
    height: 3,
    backgroundColor: "#1AADDC",
  },
  inner: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left:     { flex: 1 },
  title:    { fontSize: FontSize.lg, fontWeight: "800", color: C.white, letterSpacing: -0.3 },
  subtitle: { fontSize: FontSize.xs, color: "rgba(255,255,255,0.60)", marginTop: 3, fontWeight: "500", letterSpacing: 0.3 },
  right:    { marginLeft: 12 },
});
