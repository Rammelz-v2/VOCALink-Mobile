import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { ScreenHeader } from '../ui/ScreenHeader';
import { Colors as C, FontSize, Radius, Shadow, Spacing } from '../../constants/tokens';

export default function ProfileUI() {
  const { user, logout } = useAuth();
  const isTeacher = user?.status === "TEACHER";
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username || "Student";

  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const rows = isTeacher ? [
    { icon: "🏢", label: "Department",     value: user?.department   || "Not set" },
    { icon: "📚", label: "Grades Handled", value: user?.grade_handled || "Not set" },
  ] : [
    { icon: "🎓", label: "Grade Level",     value: user?.grade_level     || "Not set" },
    { icon: "💬", label: "Disability Type", value: user?.disability_type || "Not set" },
    { icon: "🧑‍🏫", label: "Teacher",        value: user?.teacher_name    || "Not assigned" },
  ];

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScreenHeader
        title="Profile"
        subtitle={isTeacher ? "Teacher Account" : "Student Account"}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={s.name}>{displayName}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>

        {/* Info card */}
        <View style={s.card}>
          {rows.map((r, i) => (
            <View key={i} style={[s.row, i < rows.length - 1 && s.rowBorder]}>
              <Text style={s.rowIcon}>{r.icon}</Text>
              <Text style={s.rowLabel}>{r.label}</Text>
              <Text style={s.rowValue}>{r.value}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity style={s.editBtn} onPress={() => router.push("/edit-profile" as any)} activeOpacity={0.85}>
          <Text style={s.editBtnText}>✏️  Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Text style={s.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  scroll:     { padding: Spacing.lg, paddingBottom: 40 },

  avatarWrap: { alignItems: "center", paddingVertical: Spacing.xl },

  // Soft ring behind the avatar circle for a bit more depth than a flat border.
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: C.tealLight,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.white,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: C.teal,
    ...Shadow.md,
  },
  avatarText: { fontSize: 26, fontWeight: "800", color: C.teal },
  name:       { fontSize: FontSize.lg, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  email:      { fontSize: FontSize.sm, color: C.text3, marginTop: 4, fontWeight: "500" },

  card: {
    backgroundColor: C.white, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: C.gray2,
    marginBottom: Spacing.lg, ...Shadow.sm,
    overflow: "hidden",
  },
  row:       { flexDirection: "row", alignItems: "center", gap: 10, padding: Spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.gray },
  rowIcon:   { fontSize: 18 },
  rowLabel:  { fontSize: FontSize.sm, color: C.text3, fontWeight: "500", flex: 1 },
  rowValue:  { fontSize: FontSize.sm, color: C.text, fontWeight: "700", maxWidth: "50%", textAlign: "right" },

  editBtn: {
    backgroundColor: C.teal, padding: Spacing.lg,
    borderRadius: Radius.lg, alignItems: "center",
    marginBottom: Spacing.md, minHeight: 56, justifyContent: "center",
    ...Shadow.md,
  },
  editBtnText:   { color: C.white, fontWeight: "800", fontSize: FontSize.md },
  logoutBtn: {
    backgroundColor: C.white, padding: Spacing.lg,
    borderRadius: Radius.lg, alignItems: "center",
    borderWidth: 1.5, borderColor: "#FCA5A5",
    minHeight: 56, justifyContent: "center",
  },
  logoutBtnText: { color: C.redDark, fontWeight: "700", fontSize: FontSize.md },
});