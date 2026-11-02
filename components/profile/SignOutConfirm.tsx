import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSize, Radius, Spacing } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface SignOutConfirmProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const SignOutConfirm: React.FC<SignOutConfirmProps> = ({ onCancel, onConfirm }) => {
  const { colors } = useTheme();
  return (
    <View style={[s.confirmCard, { backgroundColor: colors.surface }]}>
      <Text style={[s.confirmTitle, { color: colors.text }]}>Sign out of VocaLink?</Text>
      <Text style={[s.confirmSub, { color: colors.text3 }]}>
        You'll need to log back in to access your account.
      </Text>
      <View style={s.confirmBtns}>
        <TouchableOpacity
          style={[s.confirmCancelBtn, { borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={onCancel}
        >
          <Text style={[s.confirmCancelText, { color: colors.text2 }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.confirmSignOutBtn}
          activeOpacity={0.8}
          onPress={onConfirm}
        >
          <Text style={s.confirmSignOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  confirmCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: "#FCA5A5",
    padding: Spacing.lg,
  },
  confirmTitle: {
    fontSize: FontSize.md, fontWeight: "800",
    textAlign: "center", marginBottom: 6,
  },
  confirmSub: {
    fontSize: FontSize.xs, fontWeight: "500",
    textAlign: "center", marginBottom: 18, lineHeight: 18,
  },
  confirmBtns: { flexDirection: "row", gap: 10 },
  confirmCancelBtn: {
    flex: 1, paddingVertical: 13,
    borderRadius: Radius.md, borderWidth: 1.5, alignItems: "center",
  },
  confirmCancelText: { fontWeight: "700", fontSize: FontSize.sm },
  confirmSignOutBtn: {
    flex: 1, paddingVertical: 13,
    borderRadius: Radius.md, backgroundColor: "#DC2626", alignItems: "center",
  },
  confirmSignOutText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
});

export default SignOutConfirm;
