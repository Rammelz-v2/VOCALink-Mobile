import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors as C, FontSize, Radius } from "../../constants/tokens";
import { useTheme } from "../../contexts/ThemeContext";
import type { AACCategory } from "../../constants/types";

export const CATEGORIES: { id: AACCategory; label: string; emoji: string; color: string }[] = [
  { id: "all",           label: "All",       emoji: "📋", color: "#475569" },
  { id: "requests",      label: "Requests",  emoji: "✋", color: "#F59E0B" },
  { id: "emotions",      label: "Feelings",  emoji: "😊", color: "#EC4899" },
  { id: "classroom",     label: "Class",     emoji: "📖", color: "#8B5CF6" },
  { id: "actions",       label: "Actions",   emoji: "✅", color: "#22C55E" },
  { id: "communication", label: "Talk",      emoji: "💬", color: "#DB2777" },
  { id: "people",        label: "People",    emoji: "👤", color: "#F97316" },
  { id: "places",        label: "Places",    emoji: "📍", color: "#0D9488" },
  { id: "math",          label: "Math",      emoji: "➕", color: "#2563EB" },
  { id: "emergency",     label: "Emergency", emoji: "🚨", color: "#DC2626" },
  { id: "countries",     label: "Countries", emoji: "🚩", color: "#0369A1" },
];

interface CategoryTabsProps {
  category: AACCategory;
  setCategory: (cat: AACCategory) => void;
  isTablet: boolean;
  hPad: number;
  catScrollRef: React.RefObject<ScrollView>;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ category, setCategory, isTablet, hPad, catScrollRef }) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      ref={catScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[s.row, { paddingHorizontal: hPad }]}
      style={s.wrap}
    >
      {CATEGORIES.map(cat => {
        const active = category === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => { Haptics.selectionAsync(); setCategory(cat.id); }}
            activeOpacity={0.8}
            style={[
              s.tab,
              { backgroundColor: colors.surface },
              active && { backgroundColor: cat.color, borderColor: cat.color },
              isTablet && s.tabTablet,
            ]}
          >
            <Text style={[s.emoji, isTablet && { fontSize: 24 }]}>{cat.emoji}</Text>
            <Text style={[
              s.label,
              { color: colors.text2 },
              active && s.labelActive,
              isTablet && { fontSize: FontSize.base },
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  wrap:      { maxHeight: 78, flexGrow: 0 },
  row:       { gap: 10, alignItems: "center", paddingVertical: 10 },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.08)",
    minHeight: 52,
  },
  tabTablet:  { paddingHorizontal: 22, paddingVertical: 14, minHeight: 58 },
  emoji:      { fontSize: 22 },
  label:      { fontSize: FontSize.base, color: C.text2, fontWeight: "600" },
  labelActive:{ color: C.white, fontWeight: "700" },
});

export default CategoryTabs;
