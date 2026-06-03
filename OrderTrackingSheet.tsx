import { Ionicons } from "@expo/vector-icons";
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

import DeliveryMapView from "@/components/DeliveryMapView";
import RiderChatSheet from "@/components/RiderChatSheet";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = Math.min(SCREEN_H * 0.88, 720);

export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface TrackableOrder {
  id: string;
  orderId: string;
  date: string;
  items: string[];
  total: number;
  status: OrderStatus;
  itemCount: number;
  address?: string;
  estimatedDelivery?: string;
}

interface StepConfig {
  key: string;
  label: string;
  sublabel: string;
  icon: string;
  activeIcon: string;
}

const STEPS: StepConfig[] = [
  { key: "ordered",   label: "Order Placed",   sublabel: "We received your order",         icon: "bag-outline",       activeIcon: "bag" },
  { key: "confirmed", label: "Confirmed",       sublabel: "Seller confirmed your order",    icon: "checkmark-circle-outline", activeIcon: "checkmark-circle" },
  { key: "packed",    label: "Packed",          sublabel: "Your items are packed",          icon: "cube-outline",      activeIcon: "cube" },
  { key: "shipped",   label: "Shipped",         sublabel: "Out for delivery",               icon: "bicycle-outline",   activeIcon: "bicycle" },
  { key: "delivered", label: "Delivered",       sublabel: "Package delivered successfully", icon: "home-outline",      activeIcon: "home" },
];

function getCompletedSteps(status: OrderStatus): number {
  switch (status) {
    case "Processing": return 2; // ordered + confirmed
    case "Shipped":    return 4; // ordered + confirmed + packed + shipped (active)
    case "Delivered":  return 5; // all done
    case "Cancelled":  return 1; // only ordered
    default:           return 0;
  }
}

function getActiveStep(status: OrderStatus): number {
  switch (status) {
    case "Processing": return 2; // packed is in progress
    case "Shipped":    return 3; // shipped is active (in-transit)
    case "Delivered":  return -1; // all complete
    case "Cancelled":  return -2; // cancelled state
    default:           return 0;
  }
}

const STEP_TIMESTAMPS: Record<OrderStatus, string[]> = {
  Processing: ["Just now", "2 mins ago", "", "", ""],
  Shipped:    ["Today, 9:15 AM", "Today, 9:32 AM", "Today, 11:00 AM", "On the way", ""],
  Delivered:  ["Yesterday, 9:15 AM", "Yesterday, 9:32 AM", "Yesterday, 11:00 AM", "Yesterday, 2:30 PM", "Yesterday, 5:47 PM"],
  Cancelled:  ["Order placed", "Cancelled", "", "", ""],
};

interface Props {
  order: TrackableOrder | null;
  visible: boolean;
  onClose: () => void;
}

export default function OrderTrackingSheet({ order, visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim  = useRef(new Animated.Value(SHEET_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = React.useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Pulse animation for the active (in-progress) step
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 230, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) setMounted(false); });
    }
  }, [visible]);

  if (!mounted || !order) return null;

  const completedSteps = getCompletedSteps(order.status);
  const activeStep     = getActiveStep(order.status);
  const isCancelled    = order.status === "Cancelled";
  const isDelivered    = order.status === "Delivered";
  const timestamps     = STEP_TIMESTAMPS[order.status];

  const STATUS_META: Record<OrderStatus, { color: string; bg: string; icon: string; label: string }> = {
    Processing: { color: "#D97706", bg: "#FEF3C7", icon: "time",           label: "In Progress" },
    Shipped:    { color: "#2563EB", bg: "#DBEAFE", icon: "bicycle",         label: "Out for Delivery" },
    Delivered:  { color: "#16A34A", bg: "#DCFCE7", icon: "checkmark-circle", label: "Delivered" },
    Cancelled:  { color: "#DC2626", bg: "#FEE2E2", icon: "close-circle",    label: "Cancelled" },
  };
  const meta = STATUS_META[order.status];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[StyleSheet.absoluteFill, {
            backgroundColor: "#000",
            opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
          }]}
        />
      </TouchableWithoutFeedback>

      <Animated.View style={[
        s.sheet,
        {
          backgroundColor: colors.background,
          height: SHEET_H,
          transform: [{ translateY: slideAnim }],
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
        },
      ]}>
        {/* Handle + close */}
        <View style={s.handleRow}>
          <View style={[s.handle, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Order header card */}
        <LinearGradient
          colors={isCancelled ? ["#FEE2E2", "#FEF2F2"] : isDelivered ? ["#DCFCE7", "#F0FDF4"] : [colors.secondary, colors.background]}
          style={[s.orderCard, { borderColor: colors.border }]}
        >
          <View style={s.orderCardLeft}>
            <Text style={[s.orderIdText, { color: colors.foreground }]}>{order.orderId}</Text>
            <Text style={[s.orderDateText, { color: colors.mutedForeground }]}>
              {order.date} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
            </Text>
            <Text style={[s.orderItemsText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {order.items.join(", ")}
            </Text>
          </View>
          <View>
            <View style={[s.statusPill, { backgroundColor: meta.bg }]}>
              <Ionicons name={meta.icon as any} size={13} color={meta.color} />
              <Text style={[s.statusPillText, { color: meta.color }]}>{meta.label}</Text>
            </View>
            <Text style={[s.totalText, { color: colors.foreground }]}>₹{order.total.toLocaleString("en-IN")}</Text>
          </View>
        </LinearGradient>

        {/* Estimated delivery */}
        {!isCancelled && !isDelivered && (
          <View style={[s.etaBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={15} color={colors.primary} />
            <Text style={[s.etaText, { color: colors.accent }]}>
              Estimated delivery:{" "}
              <Text style={{ fontFamily: "Inter_700Bold" }}>
                {order.estimatedDelivery ?? "Today, 7:00 PM – 9:00 PM"}
              </Text>
            </Text>
          </View>
        )}

        {/* Tracking stepper */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.stepperContainer}>
          <Text style={[s.trackTitle, { color: colors.foreground }]}>
            {isCancelled ? "Order Timeline" : "Live Tracking"}
          </Text>

          {/* ── Delivery map (Shipped / Delivered only) ─────────── */}
          {(order.status === "Shipped" || order.status === "Delivered") && (
            <View style={{ marginBottom: 20 }}>
              <DeliveryMapView
                status={order.status}
                shopName={order.items[0]?.split(" ").slice(0, 2).join(" ") + " Shop"}
              />
            </View>
          )}

          {isCancelled ? (
            <View style={s.cancelledBlock}>
              <View style={[s.cancelIcon, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="close-circle" size={40} color="#DC2626" />
              </View>
              <Text style={s.cancelledTitle}>Order Cancelled</Text>
              <Text style={[s.cancelledSub, { color: colors.mutedForeground }]}>
                This order was cancelled. Any payment will be refunded within 5–7 business days.
              </Text>
            </View>
          ) : (
            STEPS.map((step, idx) => {
              const isDone   = idx < completedSteps;
              const isActive = idx === activeStep;
              const isPending = !isDone && !isActive;
              const isLast   = idx === STEPS.length - 1;
              const ts       = timestamps[idx];

              return (
                <View key={step.key} style={s.stepRow}>
                  {/* Left: line + dot */}
                  <View style={s.stepLeft}>
                    {/* Top connector */}
                    {idx > 0 && (
                      <View style={[
                        s.connector,
                        { backgroundColor: idx <= completedSteps ? colors.primary : colors.border },
                      ]} />
                    )}

                    {/* Step dot */}
                    {isActive ? (
                      <View style={s.activeDotOuter}>
                        <Animated.View style={[
                          s.activePulse,
                          { backgroundColor: colors.primary, opacity: 0.25, transform: [{ scale: pulseAnim }] },
                        ]} />
                        <View style={[s.activeDotInner, { backgroundColor: colors.primary }]}>
                          <Ionicons name={step.activeIcon as any} size={13} color="#fff" />
                        </View>
                      </View>
                    ) : isDone ? (
                      <View style={[s.doneDot, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    ) : (
                      <View style={[s.pendingDot, { borderColor: colors.border, backgroundColor: colors.background }]}>
                        <Ionicons name={step.icon as any} size={14} color={colors.border} />
                      </View>
                    )}

                    {/* Bottom connector */}
                    {!isLast && (
                      <View style={[
                        s.connectorBottom,
                        { backgroundColor: isDone ? colors.primary : colors.border },
                      ]} />
                    )}
                  </View>

                  {/* Right: label */}
                  <View style={[s.stepContent, isLast ? {} : { paddingBottom: 20 }]}>
                    <Text style={[
                      s.stepLabel,
                      {
                        color: isDone || isActive ? colors.foreground : colors.mutedForeground,
                        fontFamily: isActive ? "Inter_700Bold" : isDone ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}>
                      {step.label}
                      {isActive && (
                        <Text style={[s.activeBadge, { color: colors.primary }]}> · Live</Text>
                      )}
                    </Text>
                    <Text style={[s.stepSublabel, { color: colors.mutedForeground }]}>{step.sublabel}</Text>
                    {ts ? (
                      <Text style={[s.stepTime, { color: isDone ? colors.primary : colors.mutedForeground }]}>
                        {ts}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          {/* Delivery address */}
          <View style={[s.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.addressLabel, { color: colors.mutedForeground }]}>Delivery Address</Text>
              <Text style={[s.addressText, { color: colors.foreground }]}>
                {order.address ?? "123, Linking Road, Bandra West, Mumbai – 400 050"}
              </Text>
            </View>
          </View>

          {/* Chat with Rider — Shipped orders only */}
          {order.status === "Shipped" && (
            <TouchableOpacity
              style={[s.chatBtn, { backgroundColor: colors.primary }]}
              onPress={() => setChatOpen(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
              <Text style={s.chatBtnText}>Chat with Rider</Text>
              <View style={s.onlinePill}>
                <View style={s.onlinePillDot} />
                <Text style={s.onlinePillText}>Online</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Help row */}
          <TouchableOpacity style={[s.helpBtn, { borderColor: colors.border }]}>
            <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
            <Text style={[s.helpText, { color: colors.primary }]}>Need help with this order?</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Rider live chat overlay — slides over the tracking sheet */}
      <RiderChatSheet
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        riderName="Rajesh Kumar"
        orderId={order.orderId}
      />
    </View>
  );
}

const s = StyleSheet.create({
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 20,
  },
  handleRow: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 4, alignItems: "center", position: "relative" },
  handle: { width: 40, height: 4, borderRadius: 2 },
  closeBtn: { position: "absolute", right: 16, top: 8, width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  orderCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    marginHorizontal: 16, marginTop: 8, marginBottom: 10,
    borderRadius: 14, borderWidth: 1, padding: 14, gap: 10,
  },
  orderCardLeft: { flex: 1, gap: 3 },
  orderIdText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  orderDateText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  orderItemsText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  statusPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  totalText: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "right" },
  etaBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8,
  },
  etaText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  stepperContainer: { paddingHorizontal: 20, paddingBottom: 24 },
  trackTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 20 },
  stepRow: { flexDirection: "row", gap: 16 },
  stepLeft: { width: 36, alignItems: "center" },
  connector: { width: 2, height: 10, marginBottom: 2 },
  connectorBottom: { width: 2, flex: 1, minHeight: 10, marginTop: 2 },
  doneDot: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  pendingDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  activeDotOuter: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  activePulse: { position: "absolute", width: 36, height: 36, borderRadius: 18 },
  activeDotInner: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  stepContent: { flex: 1, gap: 2 },
  stepLabel: { fontSize: 14, lineHeight: 20 },
  activeBadge: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  stepSublabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  stepTime: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 1 },
  cancelledBlock: { alignItems: "center", paddingVertical: 24, gap: 10 },
  cancelIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" },
  cancelledTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#DC2626" },
  cancelledSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  addressCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 16,
  },
  addressLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  addressText: { fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  helpBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1, borderRadius: 12, paddingVertical: 12, marginTop: 12,
  },
  helpText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
