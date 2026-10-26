import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

const PURPLE = "#2D226A";
const ACCENT = "#7C5CFC";

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

// ── Focused text input ────────────────────────────────────────────────────────
const StyledInput: React.FC<{
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad" | "email-address";
}> = ({ value, onChangeText, placeholder, multiline, maxLength, autoCapitalize = "sentences", keyboardType = "default" }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <TextInput
        style={[s.input, focused && s.inputFocused, multiline && s.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {maxLength !== undefined && (
        <Text style={s.charCount}>{value.length} / {maxLength}</Text>
      )}
    </View>
  );
};

// ── Field wrapper (label + icon + content) ────────────────────────────────────
const Field: React.FC<{ label: string; icon: string; children: React.ReactNode }> = ({ label, icon, children }) => (
  <View style={s.field}>
    <View style={s.fieldLabelRow}>
      <Text style={s.fieldIcon}>{icon}</Text>
      <Text style={s.fieldLabel}>{label}</Text>
    </View>
    {children}
  </View>
);

// ── Read-only locked row ──────────────────────────────────────────────────────
const LockedField: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
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

// ── Bottom-sheet dropdown ─────────────────────────────────────────────────────
const Dropdown: React.FC<{
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}> = ({ value, placeholder, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[s.input, s.dropdownRow, focused && s.inputFocused]}
        onPress={() => { setFocused(true); setOpen(true); }}
        activeOpacity={0.7}
      >
        <Text style={[value ? s.dropdownValue : s.dropdownPlaceholder, { flex: 1 }]}>
          {value || placeholder}
        </Text>
        <Text style={s.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => { setOpen(false); setFocused(false); }}
      >
        <View style={s.sheet}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => { setOpen(false); setFocused(false); }}
          />
          <View style={s.sheetCard}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>{placeholder}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[s.sheetOption, opt === value && s.sheetOptionActive]}
                  onPress={() => { onChange(opt); setOpen(false); setFocused(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.sheetOptionText, opt === value && s.sheetOptionTextActive]}>
                    {opt}
                  </Text>
                  {opt === value && (
                    <Text style={{ fontSize: 16, color: ACCENT, fontWeight: "800" }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ── Section divider title ─────────────────────────────────────────────────────
const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={s.sectionTitle}>{title}</Text>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
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

  // ── Shared state ──────────────────────────────────────────────────────────
  const [firstName, setFirstName]   = useState(user?.first_name ?? "");
  const [lastName,  setLastName]    = useState(user?.last_name  ?? "");
  const [bio,       setBio]         = useState(user?.bio        ?? "");

  // ── Student state ─────────────────────────────────────────────────────────
  const parsed = parseGradeLevel(user?.grade_level ?? "");
  const [gradeLevel,    setGradeLevel]    = useState(parsed.grade);
  const [section,       setSection]       = useState(parsed.section);
  const [disabilityType, setDisabilityType] = useState(user?.disability_type ?? "");

  // ── Teacher state ─────────────────────────────────────────────────────────
  const [displayNameT,  setDisplayNameT]  = useState(user?.display_name   ?? "");
  const [contactNumber, setContactNumber] = useState(user?.contact_number ?? "");
  const [roomSection,   setRoomSection]   = useState(user?.room_section   ?? "");
  const [department,    setDepartment]    = useState(user?.department     ?? "");
  const [gradeHandled,  setGradeHandled]  = useState(user?.grade_handled  ?? "");
  const [organization,  setOrganization]  = useState(user?.organization   ?? "");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        first_name: firstName.trim()  || undefined,
        last_name:  lastName.trim()   || undefined,
        bio:        bio.trim()        || undefined,
      };

      if (isTeacher) {
        payload.display_name   = displayNameT.trim()  || undefined;
        payload.contact_number = contactNumber.trim() || undefined;
        payload.room_section   = roomSection.trim()   || undefined;
        payload.department     = department.trim()    || undefined;
        payload.grade_handled  = gradeHandled.trim()  || undefined;
        payload.organization   = organization.trim()  || undefined;
      } else {
        const combined = section.trim()
          ? `${gradeLevel} - Section ${section.trim()}`
          : gradeLevel;
        payload.grade_level    = combined.trim()       || undefined;
        payload.disability_type = disabilityType.trim() || undefined;
      }

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
                <Text style={s.roleBadgeText}>
                  {isTeacher ? "🍎  Teacher Account" : "🎓  Student Account"}
                </Text>
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

            {/* ── Role-specific fields ────────────────────────── */}
            {!isTeacher ? (
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
            ) : (
              <View style={s.group}>
                <SectionTitle title="Professional Details" />

                <Field label="Display Name" icon="📛">
                  <StyledInput
                    value={displayNameT}
                    onChangeText={setDisplayNameT}
                    placeholder="Name shown to students"
                    autoCapitalize="words"
                  />
                </Field>

                <Field label="Department" icon="🏢">
                  <StyledInput
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="e.g. Special Education"
                    autoCapitalize="words"
                  />
                </Field>

                <Field label="Organization / School" icon="🏫">
                  <StyledInput
                    value={organization}
                    onChangeText={setOrganization}
                    placeholder="School or institution name"
                    autoCapitalize="words"
                  />
                </Field>

                <Field label="Grades Handled" icon="📋">
                  <StyledInput
                    value={gradeHandled}
                    onChangeText={setGradeHandled}
                    placeholder="e.g. Grades 7 to 10"
                    autoCapitalize="words"
                  />
                </Field>

                <Field label="Room / Section" icon="🚪">
                  <StyledInput
                    value={roomSection}
                    onChangeText={setRoomSection}
                    placeholder="e.g. Room 204 – Section B"
                    autoCapitalize="words"
                  />
                </Field>

                <Field label="Contact Number" icon="📱">
                  <StyledInput
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    placeholder="+63 9XX XXX XXXX"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </Field>
              </View>
            )}

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
  safe:   { flex: 1, backgroundColor: "#F4F2FF" },
  scroll: { paddingBottom: 52 },

  // ── Hero header ────────────────────────────────────────────────────────────
  hero: { backgroundColor: PURPLE, paddingBottom: 36, overflow: "hidden" },
  heroAccentBar: { height: 3, backgroundColor: ACCENT },
  backBtn: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, alignSelf: "flex-start" },
  backText: { fontSize: 15, fontWeight: "600", color: "rgba(255,255,255,0.75)" },

  avatarSection: { alignItems: "center", paddingTop: 10 },
  avatarRing: {
    width: 106, height: 106, borderRadius: 53,
    backgroundColor: "rgba(124,92,252,0.30)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 18, elevation: 12,
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

  // ── Form body ──────────────────────────────────────────────────────────────
  formBody: { paddingHorizontal: 16, paddingTop: 24 },

  group: { marginBottom: 28 },

  sectionTitle: {
    fontSize: 11, fontWeight: "800", color: ACCENT,
    textTransform: "uppercase", letterSpacing: 1.4,
    borderLeftWidth: 3, borderLeftColor: ACCENT,
    paddingLeft: 10, marginBottom: 18,
  },

  // ── Input field ────────────────────────────────────────────────────────────
  field:         { marginBottom: 14 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 7 },
  fieldIcon:     { fontSize: 14 },
  fieldLabel:    { fontSize: 13, fontWeight: "700", color: "#334155" },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 15, paddingVertical: 13,
    fontSize: 15, color: "#0F172A",
    shadowColor: "#2D226A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  inputFocused: { borderColor: ACCENT, borderWidth: 2 },
  inputMulti:   { minHeight: 100, paddingTop: 13 },
  charCount:    { fontSize: 11, color: "#94A3B8", textAlign: "right", marginTop: 4, paddingRight: 2 },

  // ── Dropdown ───────────────────────────────────────────────────────────────
  dropdownRow:         { flexDirection: "row", alignItems: "center" },
  dropdownValue:       { fontSize: 15, color: "#0F172A" },
  dropdownPlaceholder: { fontSize: 15, color: "#94A3B8" },
  chevron:             { fontSize: 13, color: "#94A3B8", marginLeft: 8 },

  // ── Bottom sheet ───────────────────────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14, shadowRadius: 24, elevation: 24,
  },
  sheetHandle: {
    width: 44, height: 5, borderRadius: 999,
    backgroundColor: "#E2E8F0",
    alignSelf: "center", marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 16, fontWeight: "800", color: "#0F172A",
    marginBottom: 4, paddingHorizontal: 4,
  },
  sheetOption: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  sheetOptionActive: {
    backgroundColor: "rgba(124,92,252,0.07)",
    borderRadius: 10, marginHorizontal: -4, paddingHorizontal: 12,
  },
  sheetOptionText:       { fontSize: 15, color: "#374151", fontWeight: "500" },
  sheetOptionTextActive: { color: ACCENT, fontWeight: "700" },

  // ── Locked (read-only) card ────────────────────────────────────────────────
  lockedCard: {
    backgroundColor: "#fff",
    borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#2D226A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  lockedRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  lockedIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#F4F2FF",
    alignItems: "center", justifyContent: "center",
  },
  lockedLabel: {
    fontSize: 10, fontWeight: "700", color: "#94A3B8",
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3,
  },
  lockedValue: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  lockIcon:    { fontSize: 13, opacity: 0.35 },
  lockedDivider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 16 },
  lockedNote: {
    fontSize: 12, color: "#94A3B8",
    marginTop: 8, paddingHorizontal: 4,
    lineHeight: 18,
  },

  // ── Save button ────────────────────────────────────────────────────────────
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
