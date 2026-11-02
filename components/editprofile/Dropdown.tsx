import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT = "#1AADDC";

interface DropdownProps {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (v: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ value, placeholder, options, onChange }) => {
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

const s = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 15, paddingVertical: 13,
    fontSize: 15, color: "#0F172A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  inputFocused:        { borderColor: ACCENT, borderWidth: 2 },
  dropdownRow:         { flexDirection: "row", alignItems: "center" },
  dropdownValue:       { fontSize: 15, color: "#0F172A" },
  dropdownPlaceholder: { fontSize: 15, color: "#94A3B8" },
  chevron:             { fontSize: 13, color: "#94A3B8", marginLeft: 8 },
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
    backgroundColor: "rgba(26,173,220,0.07)",
    borderRadius: 10, marginHorizontal: -4, paddingHorizontal: 12,
  },
  sheetOptionText:       { fontSize: 15, color: "#374151", fontWeight: "500" },
  sheetOptionTextActive: { color: ACCENT, fontWeight: "700" },
});

export default Dropdown;
