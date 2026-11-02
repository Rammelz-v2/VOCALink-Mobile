import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const ACCENT = "#1AADDC";

interface StyledInputProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad" | "email-address";
}

const StyledInput: React.FC<StyledInputProps> = ({
  value, onChangeText, placeholder, multiline, maxLength,
  autoCapitalize = "sentences", keyboardType = "default",
}) => {
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
  inputFocused: { borderColor: ACCENT, borderWidth: 2 },
  inputMulti:   { minHeight: 100, paddingTop: 13 },
  charCount:    { fontSize: 11, color: "#94A3B8", textAlign: "right", marginTop: 4, paddingRight: 2 },
});

export default StyledInput;
