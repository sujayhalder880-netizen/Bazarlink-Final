import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = Math.min(SCREEN_H * 0.72, 560);
const FREE_DELIVERY_MIN = 499;

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export default function CartSheet({ visible, onClose, onCheckout }: CartSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setOrdered(false);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 240, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) setMounted(false); });
    }
  }, [visible]);

  if (!mounted && !visible) return null;

  const deliveryFee = totalPrice >= FREE_DELIVERY_MIN ? 0 : 49;
  const grandTotal = totalPrice + deliveryFee;
  const toFreeDelivery = FREE_DELIVERY_MIN - totalPrice;

  const handleOrder = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOrdered(true);
    setTimeout(() => {
      clearCart();
      onClose();
      setOrdered(false);
    }, 2000);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[StyleSheet.absoluteFill, {
            backgroundColor: "#000",
            opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
          }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          s.sheet,
          {
            backgroundColor: colors.background,
            height: SHEET_H,
            bottom: 0,
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        {/* Handle */}
        <View style={s.handleRow}>
          <View style={[s.handle, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={s.sheetHeader}>
          <Text style={[s.sheetTitle, { color: colors.foreground }]}>
            My Cart
          </Text>
          {totalItems > 0 && (
            <View style={[s.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={s.countText}>{totalItems} {totalItems === 1 ? "item" : "items"}</Text>
            </View>
          )}
        </View>

        {ordered ? (
          /* ── Order success ─────────────────────────── */
          <View style={s.successBlock}>
            <View style={[s.successCircle, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="checkmark-circle" size={52} color="#16A34A" />
            </View>
            <Text style={[s.successTitle, { color: colors.foreground }]}>Order Placed!</Text>
            <Text style={[s.successSub, { color: colors.mutedForeground }]}>
              Your order has been received. We'll notify you with updates.
            </Text>
          </View>
        ) : items.length === 0 ? (
          /* ── Empty cart ────────────────────────────── */
          <View style={s.empty}>
            <Ionicons name="bag-outline" size={52} color={colors.border} />
            <Text style={[s.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
            <Text style={[s.emptySub, { color: colors.mutedForeground }]}>
              Add items from the home screen to get started
            </Text>
            <TouchableOpacity
              style={[s.browseBtn, { backgroundColor: colors.secondary }]}
              onPress={onClose}
            >
              <Text style={[s.browseBtnText, { color: colors.primary }]}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Free delivery progress */}
            {toFreeDelivery > 0 && (
              <View style={[s.freeBar, { backgroundColor: colors.secondary }]}>
                <Ionicons name="bicycle" size={14} color={colors.primary} />
                <Text style={[s.freeText, { color: colors.accent }]}>
                  Add ₹{toFreeDelivery} more for{" "}
                  <Text style={{ fontFamily: "Inter_700Bold" }}>FREE delivery</Text>
                </Text>
              </View>
            )}
            {toFreeDelivery <= 0 && (
              <View style={[s.freeBar, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={[s.freeText, { color: "#16A34A" }]}>
                  <Text style={{ fontFamily: "Inter_700Bold" }}>FREE delivery</Text> unlocked!
                </Text>
              </View>
            )}

            {/* Items list */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.itemsList}>
              {items.map((item) => (
                <View key={item.id} style={[s.cartItem, { borderBottomColor: colors.border }]}>
                  <View style={[s.itemIcon, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
                  </View>
                  <View style={s.itemInfo}>
                    <Text style={[s.itemName, { color: colors.foreground }]} numberOfLines={2}>{item.name}</Text>
                    {item.shop && (
                      <Text style={[s.itemShop, { color: colors.primary }]} numberOfLines={1}>{item.shop}</Text>
                    )}
                    <Text style={[s.itemPrice, { color: colors.foreground }]}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View style={s.qtyControls}>
                    <TouchableOpacity
                      style={[s.qtyBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                      onPress={() => { updateQuantity(item.id, item.quantity - 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    >
                      <Ionicons
                        name={item.quantity === 1 ? "trash-outline" : "remove"}
                        size={16}
                        color={item.quantity === 1 ? "#DC2626" : colors.foreground}
                      />
                    </TouchableOpacity>
                    <Text style={[s.qtyNum, { color: colors.foreground }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[s.qtyBtn, { borderColor: colors.primary, backgroundColor: colors.secondary }]}
                      onPress={() => { updateQuantity(item.id, item.quantity + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    >
                      <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Summary + CTA */}
            <View style={[s.footer, { borderTopColor: colors.border }]}>
              <View style={s.summaryRow}>
                <View style={s.summaryLine}>
                  <Text style={[s.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                  <Text style={[s.summaryVal, { color: colors.foreground }]}>₹{totalPrice.toLocaleString("en-IN")}</Text>
                </View>
                <View style={s.summaryLine}>
                  <Text style={[s.summaryLabel, { color: colors.mutedForeground }]}>Delivery</Text>
                  <Text style={[s.summaryVal, { color: deliveryFee === 0 ? "#16A34A" : colors.foreground }]}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </Text>
                </View>
                <View style={[s.summaryLine, s.totalLine]}>
                  <Text style={[s.totalLabel, { color: colors.foreground }]}>Total</Text>
                  <Text style={[s.totalVal, { color: colors.primary }]}>₹{grandTotal.toLocaleString("en-IN")}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={{ borderRadius: 14, overflow: "hidden" }}
                onPress={handleOrder}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.checkoutBtn}
                >
                  <Ionicons name="bag-check" size={20} color="#fff" />
                  <Text style={s.checkoutText}>Place Order · ₹{grandTotal.toLocaleString("en-IN")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleRow: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
    alignItems: "center",
    position: "relative",
  },
  handle: { width: 40, height: 4, borderRadius: 2 },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  sheetTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  countBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  countText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  freeBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  freeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  itemsList: { paddingHorizontal: 16, paddingBottom: 8 },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  itemShop: { fontSize: 11, fontFamily: "Inter_500Medium" },
  itemPrice: { fontSize: 14, fontFamily: "Inter_700Bold", marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyNum: { fontSize: 15, fontFamily: "Inter_700Bold", minWidth: 22, textAlign: "center" },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    gap: 12,
  },
  summaryRow: { gap: 6 },
  summaryLine: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  totalLine: { borderTopWidth: 1, borderTopColor: "transparent", paddingTop: 6 },
  totalLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  totalVal: { fontSize: 17, fontFamily: "Inter_700Bold" },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
  },
  checkoutText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, padding: 24 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  browseBtn: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
  browseBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  successBlock: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 32 },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
