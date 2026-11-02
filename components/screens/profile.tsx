import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenHeader } from '../ui/ScreenHeader';
import { Colors as C, FontSize, Radius, Shadow, Spacing } from '../../constants/tokens';
import ProfileHero from '../profile/ProfileHero';
import InfoRow from '../profile/InfoRow';
import ThemeToggleRow from '../profile/ThemeToggleRow';
import SignOutConfirm from '../profile/SignOutConfirm';

const ACCENT = "#1AADDC";

export default function ProfileUI() {
  const { user, logout }       = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : user?.username ?? "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rows = [
    { icon: "🎓", label: "Grade Level",     value: user?.grade_level     },
    { icon: "♿", label: "Disability Type", value: user?.disability_type },
    { icon: "🧑‍🏫", label: "Teacher",        value: user?.teacher_name },
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <ScreenHeader
        title="Profile"
        subtitle="Student Account"
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <ProfileHero initials={initials} displayName={displayName} email={user?.email} />

        {user?.bio ? (
          <View style={[s.bioCard, { backgroundColor: colors.surface }]}>
            <Text style={s.bioLabel}>Bio</Text>
            <Text style={[s.bioText, { color: colors.text2 }]}>{user.bio}</Text>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>Account</Text>
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InfoRow icon="🏷️" label="Username" value={user?.username} />
            <InfoRow icon="📧" label="Email"    value={user?.email} last />
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>Student Details</Text>
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {rows.map((r, i) => (
              <InfoRow
                key={r.label}
                icon={r.icon}
                label={r.label}
                value={r.value}
                last={i === rows.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={s.section}>
          <ThemeToggleRow isDark={isDark} onToggle={toggleTheme} />

          <TouchableOpacity
            style={s.editBtn}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/edit-profile" as any);
            }}
          >
            <Text style={s.editBtnIcon}>✏️</Text>
            <Text style={s.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          {showSignOutConfirm ? (
            <SignOutConfirm
              onCancel={() => setShowSignOutConfirm(false)}
              onConfirm={() => { setShowSignOutConfirm(false); logout(); }}
            />
          ) : (
            <TouchableOpacity
              style={[s.logoutBtn, { backgroundColor: colors.surface }]}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                setShowSignOutConfirm(true);
              }}
            >
              <Text style={s.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 48 },

  bioCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1.5, borderColor: "#E2E8F0",
    ...Shadow.sm,
  },
  bioLabel: { fontSize: 10, fontWeight: "800", color: ACCENT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  bioText:  { fontSize: FontSize.sm, color: C.text2, fontWeight: "500", lineHeight: 22 },

  section:      { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: "800",
    letterSpacing: -0.3, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: ACCENT, paddingLeft: 10,
  },

  card: {
    borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Shadow.sm,
    shadowColor: "#0F172A", shadowOpacity: 0.07,
  },

  editBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 16, borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
    shadowColor: ACCENT, shadowOpacity: 0.35,
  },
  editBtnIcon: { fontSize: 18 },
  editBtnText: { color: "#fff", fontWeight: "800", fontSize: FontSize.md },

  logoutBtn: {
    paddingVertical: 16, borderRadius: Radius.lg,
    alignItems: "center",
    borderWidth: 1.5, borderColor: "#FCA5A5",
  },
  logoutBtnText: { color: C.redDark, fontWeight: "700", fontSize: FontSize.md },
});
