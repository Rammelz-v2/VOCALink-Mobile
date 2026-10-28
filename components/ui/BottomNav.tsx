import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { Colors as C, FontSize, Shadow } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import { useLayout } from "../../hooks/useLayout";

export type TabName = "home" | "board" | "livecc" | "profile";

interface TabItem {
  id: TabName;
  label: string;
  emoji: string;
}

const ALL_TABS: TabItem[] = [
  { id: "home",    label: "Home",      emoji: "🏠"  },
  { id: "board",   label: "AAC Board", emoji: "🗣️" },
  { id: "livecc",  label: "Live CC",   emoji: "📝"  },
  { id: "profile", label: "Profile",   emoji: "👤"  },
];

interface BottomNavProps {
  active: TabName;
  setActive: (tab: TabName) => void;
  unread?: number;
}

// ── Individual animated tab button ───────────────────────────────────────────
const AnimatedTabButton: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  showBadge: boolean;
  iconWrapHeight: number;
  iconWrapWidth: number;
  emojiSize: number;
  emojiActiveSize: number;
  labelSize: number;
}> = ({ tab, isActive, onPress, showBadge, iconWrapHeight, iconWrapWidth, emojiSize, emojiActiveSize, labelSize }) => {
  const scale = useSharedValue(1);

  useEffect(() => {}, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.75, { damping: 8, stiffness: 500 }),
      withSpring(1.0,  { damping: 10, stiffness: 220 }),
    );
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.tab}>
      <Animated.View style={[
        styles.iconWrap,
        { width: iconWrapWidth, height: iconWrapHeight },
        isActive && styles.iconActive,
        animStyle,
      ]}>
        <Text style={{ fontSize: isActive ? emojiActiveSize : emojiSize }}>{tab.emoji}</Text>
        {showBadge && <View style={styles.badge} />}
      </Animated.View>
      <Text style={[styles.label, { fontSize: labelSize }, isActive && styles.labelActive]}>
        {tab.label}
      </Text>
      {isActive && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
};

// ── Main nav bar ──────────────────────────────────────────────────────────────
const BottomNav: React.FC<BottomNavProps> = ({ active, setActive, unread = 0 }) => {
  const insets       = useSafeAreaInsets();
  const { user }     = useAuth();
  const { colors }   = useTheme();
  const { isTablet, isLandscape } = useLayout();
  const isTeacher    = user?.status === "TEACHER";

  const visibleTabs = ALL_TABS.filter(tab => {
    if (isTeacher && (tab.id === "board" || tab.id === "livecc")) return false;
    return true;
  });

  const paddingBottom  = Math.max(insets.bottom, isLandscape ? 4 : 8);
  const paddingTop     = isTablet ? 14 : (isLandscape ? 6 : 10);
  const iconWrapHeight = isTablet ? 40 : (isLandscape ? 26 : 32);
  const iconWrapWidth  = isTablet ? 64 : (isLandscape ? 48 : 52);
  const emojiSize      = isTablet ? 24 : (isLandscape ? 18 : 19);
  const emojiActiveSize= isTablet ? 26 : (isLandscape ? 20 : 21);
  const labelSize      = isTablet ? FontSize.sm : FontSize.xs;

  return (
    <View style={[styles.container, { paddingBottom, paddingTop, backgroundColor: colors.surface }]}>
      {visibleTabs.map(tab => (
        <AnimatedTabButton
          key={tab.id}
          tab={tab}
          isActive={active === tab.id}
          onPress={() => setActive(tab.id)}
          showBadge={tab.id === "home" && unread > 0}
          iconWrapHeight={iconWrapHeight}
          iconWrapWidth={iconWrapWidth}
          emojiSize={emojiSize}
          emojiActiveSize={emojiActiveSize}
          labelSize={labelSize}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    paddingTop: 10,
    paddingHorizontal: 8,
    ...Shadow.lg,
    shadowColor: "#2D226A",
    shadowOpacity: 0.12,
  },
  tab:        { flex: 1, alignItems: "center", gap: 2 },
  iconWrap:   { width: 52, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  iconActive: { backgroundColor: "rgba(26,173,220,0.14)" },
  emoji:      { fontSize: 19 },
  emojiActive:{ fontSize: 21 },
  label:      { fontSize: FontSize.xs, color: C.text3, fontWeight: "500" },
  labelActive:{ color: "#1AADDC", fontWeight: "700" },
  activeDot:  { width: 4, height: 4, borderRadius: 999, backgroundColor: "#1AADDC", marginTop: 1 },
  badge: {
    position: "absolute", top: 2, right: 6,
    width: 8, height: 8, borderRadius: 999,
    backgroundColor: "#EF4444",
    borderWidth: 1.5, borderColor: "#fff",
  },
});

export default BottomNav;
