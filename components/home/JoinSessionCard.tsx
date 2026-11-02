import React, { useState } from "react";
import {
  ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface JoinSessionCardProps {
  joinError?: string | null;
  joining?: boolean;
  onJoin: (code: string) => Promise<{ ok: boolean; error?: string }>;
  hPad: number;
  isLandscape: boolean;
}

const JoinSessionCard: React.FC<JoinSessionCardProps> = ({
  joinError, joining = false, onJoin, hPad, isLandscape,
}) => {
  const { colors } = useTheme();
  const [codeInput, setCodeInput] = useState("");

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={[
        s.card,
        { marginHorizontal: hPad, backgroundColor: colors.surface },
        isLandscape && { elevation: 0, shadowOpacity: 0 },
      ]}
    >
      <View style={s.header}>
        <View style={s.iconWrap}>
          <Text style={{ fontSize: 26 }}>📡</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: colors.text }]}>Join a Class Session</Text>
          <Text style={[s.sub, { color: colors.text3 }]}>Enter the code your teacher shared</Text>
        </View>
      </View>

      <TextInput
        style={[s.input, { backgroundColor: colors.input, color: colors.text }]}
        value={codeInput}
        onChangeText={(t) => setCodeInput(t.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        placeholder="e.g. ABC123"
        placeholderTextColor={colors.text3}
        autoCapitalize="characters"
        maxLength={8}
        autoCorrect={false}
      />

      {joinError ? (
        <View style={s.errorRow}>
          <Text style={s.error}>⚠️  {joinError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[s.btn, (!codeInput.trim() || joining) && s.btnOff]}
        disabled={!codeInput.trim() || joining}
        activeOpacity={0.85}
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const result = await onJoin(codeInput);
          if (result?.ok) {
            setCodeInput("");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }}
      >
        {joining
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>Join Session →</Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  card: {
    marginVertical: Spacing.lg,
    borderRadius: Radius.xl, padding: Spacing.lg, gap: 14,
    borderWidth: 1, borderColor: "#E2E8F0",
    ...Shadow.md, shadowColor: "#000",
  },
  header:  { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap:{ width: 52, height: 52, borderRadius: Radius.lg, backgroundColor: C.purpleLight, alignItems: "center", justifyContent: "center" },
  title:   { fontSize: FontSize.lg, fontWeight: "800" },
  sub:     { fontSize: FontSize.xs, fontWeight: "500", marginTop: 3 },
  input: {
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: "#E2E8F0",
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 22, fontWeight: "800", letterSpacing: 4, textAlign: "center",
  },
  errorRow:{ alignItems: "center" },
  error:   { fontSize: FontSize.sm, color: "#EF4444", fontWeight: "600", textAlign: "center" },
  btn:     { backgroundColor: "#1AADDC", borderRadius: Radius.full, paddingVertical: 14, alignItems: "center", ...Shadow.sm },
  btnOff:  { backgroundColor: "#94A3B8" },
  btnText: { fontSize: FontSize.base, fontWeight: "800", color: C.white },
});

export default JoinSessionCard;
