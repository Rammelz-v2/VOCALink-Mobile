import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import StyledInput from "../components/editprofile/StyledInput";
import Field from "../components/editprofile/Field";
import LockedField from "../components/editprofile/LockedField";
import Dropdown from "../components/editprofile/Dropdown";
import SectionTitle from "../components/editprofile/SectionTitle";

const PURPLE = "#0F172A";
const ACCENT = "#1AADDC";

const GRADE_OPTIONS = [
  "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4",
  "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9",
  "Grade 10", "Grade 11", "Grade 12",
];

function parseGradeLevel(value: string): { grade: string; section: string } {
  if (!value) return { grade: "", section: "" };
  const match = value.match(/^(.*?)(?:\s*-\s*Section\s*(.+))?$/i);
  return {
    grade: match?.[1]?.trim() ?? value,
    section: match?.[2]?.trim() ?? "",
  };
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : user?.username ?? "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [firstName, setFirstName]   = useState(user?.first_name ?? "");
  const [lastName,  setLastName]    = useState(user?.last_name  ?? "");
  const [bio,       setBio]         = useState(user?.bio        ?? "");

  const parsed = parseGradeLevel(user?.grade_level ?? "");
  const [gradeLevel,    setGradeLevel]    = useState(parsed.grade);
  const [section,       setSection]       = useState(parsed.section);
  const [disabilityType, setDisabilityType] = useState(user?.disability_type ?? "");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        first_name: firstName.trim()  || undefined,
        last_name:  lastName.trim()   || undefined,
        bio:        bio.trim()        || undefined,
      };

      const combined = section.trim()
        ? `${gradeLevel} - Section ${section.trim()}`
        : gradeLevel;
      payload.grade_level     = combined.trim()        || undefined;
      payload.disability_type = disabilityType.trim()  || undefined;

      await updateProfile(payload);
      Alert.alert("Saved ✓", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Could not save changes. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >

          {/* ── HERO HEADER ───────────────────────────────────────── */}
          <View style={s.hero}>
            <View style={s.heroAccentBar} />

            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={s.avatarSection}>
              <View style={s.avatarRing}>
                <View style={s.avatar}>
                  <Text style={s.avatarInitials}>{initials}</Text>
                </View>
              </View>
              <Text style={s.heroName}>{displayName}</Text>
              <Text style={s.heroUsername}>@{user?.username}</Text>
              <View style={s.roleBadge}>
                <Text style={s.roleBadgeText}>🎓  Student Account</Text>
              </View>
            </View>
          </View>

          {/* ── FORM BODY ──────────────────────────────────────────── */}
          <View style={s.formBody}>

            {/* ── Personal Info ──────────────────────────────── */}
            <View style={s.group}>
              <SectionTitle title="Personal Info" />

              <Field label="First Name" icon="✏️">
                <StyledInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Your first name"
                  autoCapitalize="words"
                />
              </Field>

              <Field label="Last Name" icon="✏️">
                <StyledInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Your last name"
                  autoCapitalize="words"
                />
              </Field>

              <Field label="Bio" icon="💬">
                <StyledInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="A short bio about yourself…"
                  multiline
                  maxLength={200}
                />
              </Field>
            </View>

            {/* ── Account — read-only ─────────────────────────── */}
            <View style={s.group}>
              <SectionTitle title="Account" />
              <View style={s.lockedCard}>
                <LockedField icon="🏷️" label="Username" value={user?.username ?? ""} />
                <View style={s.lockedDivider} />
                <LockedField icon="📧" label="Email" value={user?.email ?? ""} />
              </View>
              <Text style={s.lockedNote}>
                Username and email can only be changed by an administrator.
              </Text>
            </View>

            {/* ── Student Details ─────────────────────────────── */}
            <View style={s.group}>
              <SectionTitle title="Student Details" />

              <Field label="Grade Level" icon="📚">
                <Dropdown
                  value={gradeLevel}
                  placeholder="Select grade level"
                  options={GRADE_OPTIONS}
                  onChange={setGradeLevel}
                />
              </Field>

              <Field label="Section" icon="🔢">
                <StyledInput
                  value={section}
                  onChangeText={setSection}
                  placeholder="e.g. Section A"
                  autoCapitalize="words"
                />
              </Field>

              <Field label="Disability / Communication Type" icon="♿">
                <StyledInput
                  value={disabilityType}
                  onChangeText={setDisabilityType}
                  placeholder="e.g. Nonverbal, Speech delay, ASD"
                  autoCapitalize="sentences"
                />
              </Field>
            </View>

            {/* ── Save button ─────────────────────────────────── */}
            <TouchableOpacity
              style={[s.saveBtn, saving && s.saveBtnOff]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={s.saveBtnIcon}>💾</Text>
                    <Text style={s.saveBtnText}>Save Changes</Text>
                  </>
              }
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: "#F0F5F9" },
  scroll: { paddingBottom: 120 },

  hero: { backgroundColor: PURPLE, paddingBottom: 36, overflow: "hidden" },
  heroAccentBar: { height: 3, backgroundColor: ACCENT },
  backBtn: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, alignSelf: "flex-start" },
  backText: { fontSize: 15, fontWeight: "600", color: "rgba(255,255,255,0.75)" },

  avatarSection: { alignItems: "center", paddingTop: 10 },
  avatarRing: {
    width: 106, height: 106, borderRadius: 53,
    backgroundColor: "rgba(26,173,220,0.18)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1AADDC", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 12,
  },
  avatarInitials: { fontSize: 34, fontWeight: "900", color: "#fff", letterSpacing: -1 },
  heroName:     { fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  heroUsername: { fontSize: 13, color: "rgba(255,255,255,0.50)", marginTop: 3, fontWeight: "500" },
  roleBadge: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.20)",
  },
  roleBadgeText: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.90)" },

  formBody: { paddingHorizontal: 16, paddingTop: 24 },
  group: { marginBottom: 28 },

  lockedCard: {
    backgroundColor: "#fff",
    borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  lockedDivider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 16 },
  lockedNote: {
    fontSize: 12, color: "#94A3B8",
    marginTop: 8, paddingHorizontal: 4,
    lineHeight: 18,
  },

  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
    backgroundColor: ACCENT,
    paddingVertical: 18, borderRadius: 18,
    marginTop: 4,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42, shadowRadius: 16, elevation: 10,
  },
  saveBtnOff:  { backgroundColor: "#94A3B8", shadowOpacity: 0 },
  saveBtnIcon: { fontSize: 20 },
  saveBtnText: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },
});
