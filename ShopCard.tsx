import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useSaved } from "@/context/SavedContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_W = width - 32;

export interface Shop {
  id: string;
  name: string;
  category: string;
  rating: number;
  orders: string;
  tagline: string;
  iconBg: string;
  iconColor: string;
  icon: string;
}

export const SHOPS: Shop[] = [
  { id: "s1", name: "XYZ Hardware Traders",  category: "Hardware", rating: 4.8, orders: "500+", tagline: "Screws, bolts, fittings & tools", iconBg: "#FEF3C7", iconColor: "#D97706", icon: "hammer" },
  { id: "s2", name: "Mumbai Plywood Co.",    category: "Plywood",  rating: 4.6, orders: "300+", tagline: "BWR, MDF, commercial boards",   iconBg: "#FEF9C3", iconColor: "#CA8A04", icon: "layers" },
  { id: "s3", name: "Sharma Steel & Iron",   category: "Hardware", rating: 4.5, orders: "250+", tagline: "Bars, pipes, structural steel",   iconBg: "#E5E7EB", iconColor: "#374151", icon: "construct" },
  { id: "s4", name: "FreshMart Daily",       category: "Groceries",rating: 4.5, orders: "1000+",tagline: "Fresh produce, dairy & staples",  iconBg: "#DCFCE7", iconColor: "#16A34A", icon: "leaf" },
  { id: "s5", name: "TechZone Electronics",  category: "Electronics",rating:4.7,orders: "800+", tagline: "Mobiles, laptops, accessories",   iconBg: "#DBEAFE", iconColor: "#2563EB", icon: "hardware-chip" },
];

export default function ShopCard({ shop }: { shop: Shop }) {
  const colors = useColors();
  const { isShopSaved, toggleShop } = useSaved();
  const saved = isShopSaved(shop.id);

  const handleSave = () => {
    toggleShop(shop.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
    >
      <View style={[s.iconBox, { backgroundColor: shop.iconBg }]}>
        <Ionicons name={shop.icon as any} size={28} color={shop.iconColor} />
      </View>
      <View style={s.info}>
        <Text style={[s.name, { color: colors.foreground }]} numberOfLines={1}>{shop.name}</Text>
        <Text style={[s.tagline, { color: colors.mutedForeground }]} numberOfLines={1}>{shop.tagline}</Text>
        <View style={s.meta}>
          <View style={[s.badge, { backgroundColor: colors.muted }]}>
            <Text style={[s.badgeText, { color: colors.mutedForeground }]}>{shop.category}</Text>
          </View>
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text style={[s.rating, { color: colors.foreground }]}>{shop.rating}</Text>
          <Text style={[s.orders, { color: colors.mutedForeground }]}>· {shop.orders} orders</Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons
          name={saved ? "bookmark" : "bookmark-outline"}
          size={22}
          color={saved ? colors.primary : colors.mutedForeground}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    width: CARD_W,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 2 },
  tagline: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  rating: { fontSize: 12, fontFamily: "Inter_700Bold" },
  orders: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
