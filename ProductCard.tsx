import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useCart } from "@/context/CartContext";
import { useSaved } from "@/context/SavedContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
export const CARD_WIDTH = (width - 16 * 2 - 12) / 2;

export const CATEGORY_STYLES: Record<string, { bg: string; iconColor: string; icon: string }> = {
  Hardware:    { bg: "#FEF3C7", iconColor: "#D97706", icon: "hammer" },
  Plywood:     { bg: "#FEF9C3", iconColor: "#CA8A04", icon: "layers" },
  Electronics: { bg: "#DBEAFE", iconColor: "#2563EB", icon: "hardware-chip" },
  Fashion:     { bg: "#FCE7F3", iconColor: "#DB2777", icon: "shirt" },
  Groceries:   { bg: "#DCFCE7", iconColor: "#16A34A", icon: "leaf" },
  Home:        { bg: "#FFF7ED", iconColor: "#F97316", icon: "home" },
  Sports:      { bg: "#FEE2E2", iconColor: "#DC2626", icon: "fitness" },
  Beauty:      { bg: "#F3E8FF", iconColor: "#9333EA", icon: "sparkles" },
  Books:       { bg: "#E0F2FE", iconColor: "#0284C7", icon: "book" },
  Tools:       { bg: "#F0FDF4", iconColor: "#15803D", icon: "construct" },
};

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  category: string;
  discount: number;
  shop?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const colors = useColors();
  const { isProductSaved, toggleProduct } = useSaved();
  const { addItem, isInCart, getQuantity, updateQuantity, removeItem } = useCart();
  const isFav = isProductSaved(product.id);
  const inCart = isInCart(product.id);
  const qty = getQuantity(product.id);
  const catStyle = CATEGORY_STYLES[product.category] ?? { bg: "#F3F4F6", iconColor: "#6B7280", icon: "grid" };

  const handleFav = () => {
    toggleProduct(product.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      shop: product.shop,
      iconBg: catStyle.bg,
      iconColor: catStyle.iconColor,
      icon: catStyle.icon,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.88}
    >
      {/* Image area */}
      <View style={[s.imageArea, { backgroundColor: catStyle.bg }]}>
        <Ionicons name={catStyle.icon as any} size={48} color={catStyle.iconColor} />
        {product.discount > 0 && (
          <View style={[s.discountBadge, { backgroundColor: colors.primary }]}>
            <Text style={s.discountText}>{product.discount}% OFF</Text>
          </View>
        )}
        <TouchableOpacity
          style={[s.favBtn, { backgroundColor: isFav ? "#FEF2F2" : "rgba(255,255,255,0.9)" }]}
          onPress={handleFav}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={18} color={isFav ? "#EF4444" : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={s.info}>
        {product.shop && (
          <Text style={[s.shopName, { color: colors.primary }]} numberOfLines={1}>
            {product.shop}
          </Text>
        )}
        <Text style={[s.name, { color: colors.foreground }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={s.ratingRow}>
          <Ionicons name="star" size={11} color="#FBBF24" />
          <Text style={[s.ratingText, { color: colors.mutedForeground }]}>
            {product.rating} ({product.reviews})
          </Text>
        </View>
        <View style={s.priceRow}>
          <Text style={[s.price, { color: colors.foreground }]}>
            ₹{product.price.toLocaleString("en-IN")}
          </Text>
          {product.originalPrice > product.price && (
            <Text style={[s.originalPrice, { color: colors.mutedForeground }]}>
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </Text>
          )}
        </View>

        {/* Cart controls */}
        {inCart ? (
          <View style={[s.qtyRow, { borderColor: colors.primary }]}>
            <TouchableOpacity
              style={[s.qtyBtn, { backgroundColor: colors.secondary }]}
              onPress={() => { updateQuantity(product.id, qty - 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Ionicons name={qty === 1 ? "trash-outline" : "remove"} size={14} color={qty === 1 ? "#DC2626" : colors.primary} />
            </TouchableOpacity>
            <Text style={[s.qtyNum, { color: colors.primary }]}>{qty}</Text>
            <TouchableOpacity
              style={[s.qtyBtn, { backgroundColor: colors.secondary }]}
              onPress={() => { updateQuantity(product.id, qty + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Ionicons name="add" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
            activeOpacity={0.75}
            onPress={handleAddToCart}
          >
            <Ionicons name="add-circle-outline" size={15} color={colors.primary} />
            <Text style={[s.addText, { color: colors.primary }]}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { width: CARD_WIDTH, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  imageArea: { height: 130, justifyContent: "center", alignItems: "center", position: "relative" },
  discountBadge: {
    position: "absolute", top: 8, left: 8,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  discountText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  favBtn: {
    position: "absolute", top: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  info: { padding: 10, gap: 4 },
  shopName: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  name: { fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  price: { fontSize: 15, fontFamily: "Inter_700Bold" },
  originalPrice: { fontSize: 11, fontFamily: "Inter_400Regular", textDecorationLine: "line-through" },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 8, paddingVertical: 7, gap: 4, borderWidth: 1,
  },
  addText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  qtyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderRadius: 8, overflow: "hidden",
  },
  qtyBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  qtyNum: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1, textAlign: "center" },
});
