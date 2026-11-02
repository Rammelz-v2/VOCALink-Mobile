import React from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import { FontSize, Radius, Shadow } from "../../constants/tokens";
import type { AACIcon } from "../../constants/types";

interface AACCellProps {
  icon: AACIcon;
  onPress: (icon: AACIcon) => void;
  size: number;
  emojiSize: number;
}

const AACCell: React.FC<AACCellProps> = React.memo(({ icon, onPress, size, emojiSize }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.87, { damping: 10, stiffness: 500 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 8, stiffness: 200 }); }}
        onPress={() => onPress(icon)}
        style={[s.base, { width: size, height: size + 30, backgroundColor: icon.bg }]}
      >
        {icon.flagCode
          ? <Image
              source={{ uri: `https://flagcdn.com/w80/${icon.flagCode}.png` }}
              style={{ width: emojiSize * 1.4, height: emojiSize * 1.0, borderRadius: 4 }}
              resizeMode="cover"
            />
          : <Text style={{ fontSize: emojiSize }}>{icon.emoji}</Text>
        }
        <Text style={[s.label, { width: size - 8 }]} numberOfLines={1}>{icon.label}</Text>
      </Pressable>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  base: {
    borderRadius: Radius.xl, alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, paddingHorizontal: 8, ...Shadow.sm,
    shadowColor: "#000", shadowOpacity: 0.08,
  },
  label: {
    fontSize: FontSize.sm, fontWeight: "700", color: "#0F172A",
    textAlign: "center", paddingHorizontal: 6,
  },
});

export default AACCell;
