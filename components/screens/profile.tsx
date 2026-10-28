import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenHeader } from '../ui/ScreenHeader';
import { Colors as C, FontSize, Radius, Shadow, Spacing } from '../../constants/tokens';

const ACCENT = "#7C5CFC";
const PURPLE = "#2D226A";

// One info row inside a card
const InfoRow: React.FC<{
  icon: string;
  label: string;
  value?: string | null;
  last?: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}> = ({ icon, label, value, last, colors }) => (
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

export default function ProfileUI() {
  const { user, logout }       = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const isTeacher = user?.status === "TEACHER";

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : user?.username ?? "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const studentRows = [
    { icon: "🎓", label: "Grade Level",     value: user?.grade_level     },
    { icon: "♿", label: "Disability Type", value: user?.disability_type },
    { icon: "🧑‍🏫", label: "Teacher",        value: user?.teacher_name },
  ];

  const teacherRows = [
    { icon: "📛", label: "Display Name",    value: user?.display_name   },
    { icon: "🏢", label: "Department",      value: user?.department     },
    { icon: "🏫", label: "Organization",    value: user?.organization   },
    { icon: "📋", label: "Grades Handled",  value: user?.grade_handled  },
    { icon: "🚪", label: "Room / Section",  value: user?.room_section   },
    { icon: "📱", label: "Contact",         value: user?.contact_number },
  ];

  const rows = isTeacher ? teacherRows : studentRows;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <ScreenHeader
        title="Profile"
        subtitle={isTeacher ? "Teacher Account" : "Student Account"}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Avatar hero ─────────────────────────────────────────── */}
        <View style={s.heroWrap}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={[s.heroName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[s.heroEmail, { color: colors.text3 }]}>{user?.email}</Text>
          <View style={s.rolePill}>
            <Text style={s.rolePillText}>
              {isTeacher ? "🍎  Teacher" : "🎓  Student"}
            </Text>
          </View>
        </View>

        {/* ── Bio (if set) ─────────────────────────────────────────── */}
        {user?.bio ? (
          <View style={[s.bioCard, { backgroundColor: colors.surface }]}>
            <Text style={s.bioLabel}>Bio</Text>
            <Text style={[s.bioText, { color: colors.text2 }]}>{user.bio}</Text>
          </View>
        ) : null}

        {/* ── Account info ─────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>Account</Text>
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InfoRow icon="🏷️" label="Username" value={user?.username} colors={colors} />
            <InfoRow icon="📧" label="Email"    value={user?.email} last colors={colors} />
          </View>
        </View>

        {/* ── Role-specific info ───────────────────────────────────── */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>
            {isTeacher ? "Professional Details" : "Student Details"}
          </Text>
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {rows.map((r, i) => (
              <InfoRow
                key={r.label}
                icon={r.icon}
                label={r.label}
                value={r.value}
                last={i === rows.length - 1}
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <View style={s.section}>
          {/* Dark mode toggle */}
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
              onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
              trackColor={{ false: "#E2E8F0", true: "rgba(26,173,220,0.4)" }}
              thumbColor={isDark ? "#1AADDC" : "#94A3B8"}
            />
          </View>

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

          <TouchableOpacity
            style={[s.logoutBtn, { backgroundColor: colors.surface }]}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              logout();
            }}
          >
            <Text style={s.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 48 },

  // Hero
  heroWrap: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(124,92,252,0.18)",
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
  heroName:   { fontSize: FontSize.lg, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  heroEmail:  { fontSize: FontSize.sm, color: C.text3, marginTop: 4, fontWeight: "500" },
  rolePill: {
    marginTop: 12,
    backgroundColor: "rgba(124,92,252,0.10)",
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1.5, borderColor: "rgba(124,92,252,0.22)",
  },
  rolePillText: { fontSize: 13, fontWeight: "700", color: ACCENT },

  // Bio
  bioCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: "#fff",
    borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1.5, borderColor: "rgba(124,92,252,0.15)",
    ...Shadow.sm,
  },
  bioLabel: { fontSize: 10, fontWeight: "800", color: ACCENT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  bioText:  { fontSize: FontSize.sm, color: C.text2, fontWeight: "500", lineHeight: 22 },

  // Sections
  section:      { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.sm, fontWeight: "800", color: C.text,
    letterSpacing: -0.3, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: ACCENT, paddingLeft: 10,
  },

  // Info card
  card: {
    backgroundColor: "#fff",
    borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: "#E9E6FF",
    overflow: "hidden",
    ...Shadow.sm,
    shadowColor: PURPLE, shadowOpacity: 0.07,
  },
  infoRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  infoRowBorder:  { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  infoIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#F4F2FF",
    alignItems: "center", justifyContent: "center",
  },
  infoLabel:  { fontSize: 10, fontWeight: "700", color: C.text3, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 },
  infoValue:  { fontSize: FontSize.sm, fontWeight: "700", color: C.text },

  // Theme toggle
  themeRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: Radius.lg, borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  themeLeft:  { flexDirection: "row", alignItems: "center", gap: 12 },
  themeLabel: { fontSize: FontSize.md, fontWeight: "700" },
  themeSub:   { fontSize: FontSize.xs, fontWeight: "500", marginTop: 2 },

  // Edit / logout buttons
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
    backgroundColor: "#fff",
    paddingVertical: 16, borderRadius: Radius.lg,
    alignItems: "center",
    borderWidth: 1.5, borderColor: "#FCA5A5",
  },
  logoutBtnText: { color: C.redDark, fontWeight: "700", fontSize: FontSize.md },
});
