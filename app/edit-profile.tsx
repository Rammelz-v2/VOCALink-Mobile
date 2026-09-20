import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

// Preset grade levels for the dropdown. Adjust this list to match what your
// backend / school actually supports.
const GRADE_OPTIONS = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

// Splits a stored value like "Grade 10 - Section A" into its two parts so
// the dropdown and the section input can be pre-filled when editing.
function parseGradeLevel(value: string): { grade: string; section: string } {
  if (!value) return { grade: "", section: "" };
  const match = value.match(/^(.*?)(?:\s*-\s*Section\s*(.+))?$/i);
  return {
    grade: match?.[1]?.trim() ?? value,
    section: match?.[2]?.trim() ?? "",
  };
}

// A simple, dependency-free dropdown: a tappable field that opens a modal list.
const GradeDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownField}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value || "Select grade level"}
        </Text>
        <Text style={styles.dropdownChevron}>⌄</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Grade Level</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {GRADE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, option === value && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  {option === value && <Text style={styles.optionCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setOpen(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();

  const isTeacher = user?.status === "TEACHER";

  // Shared Fields
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");

  // Student-only Fields — grade level is now split into a dropdown (grade)
  // and a free-text section, then recombined into the same "grade_level"
  // string the backend already expects.
  const initialGrade = parseGradeLevel(user?.grade_level ?? "");
  const [gradeLevel, setGradeLevel] = useState(initialGrade.grade);
  const [section, setSection] = useState(initialGrade.section);
  const [disabilityType, setDisabilityType] = useState(user?.disability_type ?? "");

  // Teacher-only Fields
  const [department, setDepartment] = useState(user?.department ?? "");
  const [gradeHandled, setGradeHandled] = useState(user?.grade_handled ?? "");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      };

      if (isTeacher) {
        payload.department = department.trim() || undefined;
        payload.grade_handled = gradeHandled.trim() || undefined;
      } else {
        const combinedGrade = section.trim()
          ? `${gradeLevel} - Section ${section.trim()}`
          : gradeLevel;
        payload.grade_level = combinedGrade.trim() || undefined;
        payload.disability_type = disabilityType.trim() || undefined;
      }

      // Same updateProfile call as before — still hits your existing backend endpoint.
      await updateProfile(payload);
      Alert.alert("Saved", "Your profile has been updated.");
      router.back();
    } catch {
      Alert.alert("Error", "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Personal Info</Text>

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            autoCapitalize="words"
          />

          <Text style={styles.sectionLabel}>
            {isTeacher ? "Professional Details" : "Student Details"}
          </Text>

          {!isTeacher ? (
            <>
              <Text style={styles.label}>Grade Level</Text>
              <GradeDropdown value={gradeLevel} onChange={setGradeLevel} />

              <Text style={styles.label}>Section</Text>
              <TextInput
                style={styles.input}
                value={section}
                onChangeText={setSection}
                placeholder="e.g. Section A"
                autoCapitalize="words"
              />

              <Text style={styles.label}>Disability Type</Text>
              <TextInput
                style={styles.input}
                value={disabilityType}
                onChangeText={setDisabilityType}
                placeholder="e.g. Nonverbal, Speech delay"
                autoCapitalize="sentences"
              />
            </>
          ) : (
             <>
              <Text style={styles.label}>Department</Text>
              <TextInput
                style={styles.input}
                value={department}
                onChangeText={setDepartment}
                placeholder="e.g. Special Education"
                autoCapitalize="words"
              />

              <Text style={styles.label}>Grades Handled</Text>
              <TextInput
                style={styles.input}
                value={gradeHandled}
                onChangeText={setGradeHandled}
                placeholder="e.g. Grades 7 to 10"
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.readOnlyNote}>
            Username and email cannot be changed here.
          </Text>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backBtn: { padding: 8 },
  backText: { fontSize: 15, color: "#1AADDC", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  form: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#1AADDC", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14, marginTop: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 18 },
  readOnlyNote: { fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 4, marginBottom: 24 },
  saveBtn: { backgroundColor: "#1AADDC", padding: 16, borderRadius: 12, alignItems: "center" },
  saveBtnDisabled: { backgroundColor: "#9CA3AF" },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },

  // Dropdown field (styled to match the existing TextInput look)
  dropdownField: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: { fontSize: 15, color: "#111827" },
  dropdownPlaceholder: { fontSize: 15, color: "#9CA3AF" },
  dropdownChevron: { fontSize: 18, color: "#9CA3AF", fontWeight: "600" },

  // Modal / options list
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8, paddingHorizontal: 4 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionText: { fontSize: 15, color: "#374151" },
  optionTextSelected: { color: "#1AADDC", fontWeight: "700" },
  optionCheck: { fontSize: 15, color: "#1AADDC", fontWeight: "700" },
  modalCancel: { marginTop: 8, paddingVertical: 12, alignItems: "center" },
  modalCancelText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
});