import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSaved } from "@/context/SavedContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const ITEM_SIZE = Math.floor((width - 32 - 24) / 4);

export interface Category {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  iconColor: string;
}

// Hardware & Plywood FIRST — as per product plan
export const CATEGORIES: Category[] = [
  { id: "hardware",  name: "Hardware",   icon: "hammer",           bgColor: "#FEF3C7", iconColor: "#D97706" },
  { id: "plywood",   name: "Plywood",    icon: "layers",           bgColor: "#FEF9C3", iconColor: "#CA8A04" },
  { id: "groceries", name: "Groceries",  icon: "leaf",             bgColor: "#DCFCE7", iconColor: "#16A34A" },
  { id: "elec",      name: "Electronics",icon: "hardware-chip",    bgColor: "#DBEAFE", iconColor: "#2563EB" },
  { id: "fashion",   name: "Fashion",    icon: "shirt",            bgColor: "#FCE7F3", iconColor: "#DB2777" },
  { id: "home",      name: "Home",       icon: "home",             bgColor: "#FFF7ED", iconColor: "#F97316" },
  { id: "sports",    name: "Sports",     icon: "fitness",          bgColor: "#FEE2E2", iconColor: "#DC2626" },
  { id: "beauty",    name: "Beauty",     icon: "sparkles",         bgColor: "#F3E8FF", iconColor: "#9333EA" },
  { id: "books",     name: "Books",      icon: "book",             bgColor: "#E0F2FE", iconColor: "#0284C7" },
  { id: "tools",     name: "Tools",      icon: "construct",        bgColor: "#F0FDF4", iconColor: "#15803D" },
];

export default function CategoryGrid() {
  const colors = useColors();
  const { isCategorySaved, toggleCategory } = useSaved();

  const handleSave = (id: string) => {
    toggleCategory(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Shop by Category</Text>
        <TouchableOpacity>
          <Text style={[s.seeAll, { color: colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const saved = isCategorySaved(cat.id);
          return (
            <View key={cat.id} style={{ width: ITEM_SIZE, alignItems: "center", gap: 6 }}>
              <TouchableOpacity
                style={[s.iconBox, { backgroundColor: cat.bgColor, width: ITEM_SIZE - 4, height: ITEM_SIZE - 4 }]}
                activeOpacity={0.75}
                onPress={() => {}}
              >
                <Ionicons name={cat.icon as any} size={26} color={cat.iconColor} />
                {/* Save bookmark */}
                <TouchableOpacity
                  style={[s.saveDot, { backgroundColor: saved ? colors.primary : "rgba(0,0,0,0.12)" }]}
                  onPress={() => handleSave(cat.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={9} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
              <Text style={[s.label, { color: colors.foreground }]} numberOfLines={1}>
                {cat.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scrollContent: { gap: 8, paddingRight: 8 },
  iconBox: { borderRadius: 16, justifyContent: "center", alignItems: "center", position: "relative" },
  saveDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
});
