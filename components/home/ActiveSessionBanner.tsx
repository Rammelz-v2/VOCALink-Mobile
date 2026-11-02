import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors as C, FontSize, Radius, Shadow, Spacing } from "../../constants/tokens";

interface ActiveSessionBannerProps {
  sessionCode: string;
  onGoToLiveCC: () => void;
  onLeave: () => void;
  hPad: number;
  isLandscape: boolean;
}

const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  sessionCode, onGoToLiveCC, onLeave, hPad, isLandscape,
}) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const bannerStyle = [
    s.banner,
    { marginHorizontal: hPad },
    isLandscape && { elevation: 0, shadowOpacity: 0 },
  ];

  if (showLeaveConfirm) {
    return (
      <Animated.View entering={FadeIn.duration(350)} style={{ marginHorizontal: hPad }}>
        <View style={s.banner}>
          <Text style={[s.title, { marginBottom: 4 }]}>Leave this session?</Text>
          <Text style={[s.sub, { marginBottom: 16 }]}>You'll stop receiving live captions.</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[s.actionBtn, { flex: 1, backgroundColor: "rgba(255,255,255,0.2)" }]}
              activeOpacity={0.8}
              onPress={() => setShowLeaveConfirm(false)}
            >
              <Text style={[s.actionBtnText, { color: "#fff" }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, { flex: 1 }]}
              activeOpacity={0.8}
              onPress={() => { setShowLeaveConfirm(false); onLeave(); }}
            >
              <Text style={[s.actionBtnText, { color: "#DC2626" }]}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(350)} style={{ marginHorizontal: hPad }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onGoToLiveCC();
        }}
        style={[s.banner, isLandscape && { elevation: 0, shadowOpacity: 0 }]}
      >
        <View style={s.top}>
          <Text style={s.icon}>🟢</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Session Active!</Text>
            <Text style={s.sub}>Code: {sessionCode}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowLeaveConfirm(true)}
            style={s.leaveBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.leaveBtnText}>Leave</Text>
          </TouchableOpacity>
        </View>
        <View style={s.actionBtn}>
          <Text style={s.actionBtnText}>Go to Live CC Room →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  banner: {
    marginVertical: Spacing.lg, padding: Spacing.lg,
    backgroundColor: "#10B981", borderRadius: Radius.lg, ...Shadow.md,
  },
  top:           { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  icon:          { fontSize: 28 },
  title:         { fontSize: FontSize.lg, fontWeight: "800", color: C.white },
  sub:           { fontSize: FontSize.sm, color: "rgba(255,255,255,0.9)", fontWeight: "500", marginTop: 2 },
  leaveBtn:      { backgroundColor: "rgba(255,255,255,0.92)", borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  leaveBtnText:  { fontSize: FontSize.xs, fontWeight: "800", color: "#DC2626" },
  actionBtn:     { backgroundColor: C.white, paddingVertical: 12, borderRadius: Radius.md, alignItems: "center" },
  actionBtnText: { color: "#047857", fontWeight: "800", fontSize: FontSize.base },
});

export default ActiveSessionBanner;
