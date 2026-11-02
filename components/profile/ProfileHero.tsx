import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Shadow, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

const ACCENT = "#1AADDC";

interface ProfileHeroProps {
  initials: string;
  displayName: string;
  email?: string;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ initials, displayName, email }) => {
  const { colors } = useTheme();
  return (
    <View style={s.heroWrap}>
      <View style={s.avatarRing}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
      </View>
      <Text style={[s.heroName, { color: colors.text }]}>{displayName}</Text>
      <Text style={[s.heroEmail, { color: colors.text3 }]}>{email}</Text>
      <View style={s.rolePill}>
        <Text style={s.rolePillText}>🎓  Student</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  heroWrap: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(26,173,220,0.15)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
    ...Shadow.md,
    shadowColor: ACCENT, shadowOpacity: 0.35,
  },
  avatarText: { fontSize: 30, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  heroName:   { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  heroEmail:  { fontSize: 14, marginTop: 4, fontWeight: "500" },
  rolePill: {
    marginTop: 12,
    backgroundColor: "rgba(26,173,220,0.10)",
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1.5, borderColor: "rgba(26,173,220,0.25)",
  },
  rolePillText: { fontSize: 13, fontWeight: "700", color: ACCENT },
});

export default ProfileHero;
