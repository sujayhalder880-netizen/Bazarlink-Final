import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";

import type { OrderStatus } from "@/components/OrderTrackingSheet";

const TRACK_WIDTH = Dimensions.get("window").width - 32 - 28; // sheet padding

// Rider position along the route: 0 = at shop, 1 = at home
const STATUS_POS: Record<OrderStatus, number> = {
  Processing: 0.05,
  Shipped:    0.62,
  Delivered:  1.0,
  Cancelled:  0.0,
};

const RIDER = {
  name:    "Rajesh Kumar",
  vehicle: "Honda Activa",
  plate:   "MH-04 AB 1234",
  distance: "2.3 km",
  eta:     "~28 min",
};

interface Props {
  status: OrderStatus;
  shopName?: string;
}

export default function DeliveryMapView({ status, shopName = "XYZ Hardware" }: Props) {
  const isDelivered = status === "Delivered";
  const isShipped   = status === "Shipped";
  const isActive    = isShipped || status === "Processing";

  // Rider dot position (0..1) → translated to pixels via interpolation
  const riderAnim   = useRef(new Animated.Value(STATUS_POS[status])).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const bikeAnim    = useRef(new Animated.Value(0)).current; // slight up-down wobble

  // Only use native driver for opacity/scale, not for layout values
  const [riderLeft, setRiderLeft] = useState(STATUS_POS[status] * TRACK_WIDTH);

  useEffect(() => {
    // Update riderLeft whenever riderAnim changes
    const listener = riderAnim.addListener(({ value }) => {
      setRiderLeft(value * TRACK_WIDTH);
    });

    if (isShipped) {
      // Simulate slow forward movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(riderAnim, { toValue: 0.68, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(riderAnim, { toValue: 0.60, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(riderAnim, { toValue: 0.66, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      ).start();

      // Bike wobble (native driver OK - translateY)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bikeAnim, { toValue: -2, duration: 300, useNativeDriver: true }),
          Animated.timing(bikeAnim, { toValue:  2, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    }

    // Pulse for rider dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    return () => { riderAnim.removeListener(listener); };
  }, [status]);

  // How much of the route line is "completed" (filled orange)
  const completedWidth = riderLeft;
  const remainingWidth = TRACK_WIDTH - riderLeft;

  return (
    <View style={s.wrapper}>
      {/* Map background card */}
      <LinearGradient
        colors={isDelivered ? ["#052e16", "#14532d"] : ["#0f172a", "#1e293b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.mapCard}
      >
        {/* Grid overlay (decorative) */}
        <View style={s.grid} pointerEvents="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={`h${i}`} style={[s.gridLine, s.gridH, { top: 12 + i * 20 }]} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={`v${i}`} style={[s.gridLine, s.gridV, { left: 20 + i * 48 }]} />
          ))}
        </View>

        {/* Live / Delivered badge */}
        <View style={[s.liveBadge, { backgroundColor: isDelivered ? "#16a34a" : "#EF4444" }]}>
          <View style={[s.liveDot, { backgroundColor: isDelivered ? "#86efac" : "#fca5a5" }]} />
          <Text style={s.liveText}>{isDelivered ? "DELIVERED" : "LIVE"}</Text>
        </View>

        {/* ─── Route track ─────────────────────────────────────── */}
        <View style={s.trackRow}>
          {/* Shop pin */}
          <View style={s.pinCol}>
            <View style={[s.pin, { backgroundColor: "#F97316" }]}>
              <Ionicons name="storefront" size={14} color="#fff" />
            </View>
          </View>

          {/* Route line + rider */}
          <View style={[s.trackWrap, { width: TRACK_WIDTH }]}>
            {/* Completed segment (orange) */}
            <View style={[s.trackLine, s.trackDone, { width: completedWidth }]} />
            {/* Remaining segment (dashed white) */}
            <View style={[s.trackLine, s.trackPending, { width: remainingWidth }]} />

            {/* Rider dot */}
            <View style={[s.riderPin, { left: riderLeft - 14 }]}>
              {/* Pulse ring */}
              {isActive && (
                <Animated.View
                  style={[
                    s.riderPulse,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: pulseAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.5, 0] }),
                    },
                  ]}
                />
              )}
              {/* Bike icon */}
              <Animated.View
                style={[
                  s.riderBubble,
                  { backgroundColor: isDelivered ? "#16a34a" : "#F97316" },
                  isShipped && { transform: [{ translateY: bikeAnim }] },
                ]}
              >
                <Ionicons
                  name={isDelivered ? "checkmark" : "bicycle"}
                  size={15}
                  color="#fff"
                />
              </Animated.View>
            </View>

            {/* Waypoint dots */}
            {[0.25, 0.5, 0.75].map((frac) => {
              const px = frac * TRACK_WIDTH;
              const passed = riderLeft > px;
              return (
                <View
                  key={frac}
                  style={[
                    s.waypoint,
                    {
                      left: px - 4,
                      backgroundColor: passed ? "#F97316" : "rgba(255,255,255,0.2)",
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Home pin */}
          <View style={s.pinCol}>
            <View style={[s.pin, { backgroundColor: isDelivered ? "#16a34a" : "#334155" }]}>
              <Ionicons name="home" size={14} color="#fff" />
            </View>
          </View>
        </View>

        {/* Labels */}
        <View style={s.labelRow}>
          <Text style={s.labelText} numberOfLines={1}>{shopName}</Text>
          <Text style={s.labelText}>Your location</Text>
        </View>

        {/* Distance + ETA row */}
        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Ionicons name="navigate-outline" size={13} color="#94a3b8" />
            <Text style={s.metaText}>{RIDER.distance}</Text>
          </View>
          {!isDelivered && (
            <View style={s.metaItem}>
              <Ionicons name="time-outline" size={13} color="#94a3b8" />
              <Text style={s.metaText}>ETA {RIDER.eta}</Text>
            </View>
          )}
          <View style={s.metaItem}>
            <Ionicons name="speedometer-outline" size={13} color="#94a3b8" />
            <Text style={s.metaText}>
              {isDelivered ? "Delivered ✓" : isShipped ? "On the way" : "Preparing"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Rider info card */}
      {(isShipped || isDelivered) && (
        <View style={s.riderCard}>
          <View style={[s.riderAvatar, { backgroundColor: isDelivered ? "#DCFCE7" : "#FFF7ED" }]}>
            <Text style={[s.riderInitial, { color: isDelivered ? "#16a34a" : "#F97316" }]}>
              {RIDER.name[0]}
            </Text>
          </View>
          <View style={s.riderInfo}>
            <Text style={s.riderName}>{RIDER.name}</Text>
            <View style={s.riderMeta}>
              <Ionicons name="bicycle" size={12} color="#6B7280" />
              <Text style={s.riderSubtext}>{RIDER.vehicle}</Text>
              <Text style={s.riderDot}>·</Text>
              <Text style={s.riderSubtext}>{RIDER.plate}</Text>
            </View>
          </View>
          <View style={[s.callBtn, { backgroundColor: isDelivered ? "#DCFCE7" : "#FFF7ED" }]}>
            <Ionicons name={isDelivered ? "checkmark-done" : "call"} size={18} color={isDelivered ? "#16a34a" : "#F97316"} />
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: 8 },
  mapCard: {
    borderRadius: 16,
    padding: 14,
    gap: 12,
    overflow: "hidden",
    minHeight: 140,
  },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.07 },
  gridLine: { position: "absolute", backgroundColor: "#fff" },
  gridH:    { left: 0, right: 0, height: 1 },
  gridV:    { top: 0, bottom: 0, width: 1 },
  liveBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 2 },
  pinCol: { alignItems: "center" },
  pin: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  trackWrap: { height: 30, position: "relative", justifyContent: "center" },
  trackLine: { position: "absolute", height: 4, borderRadius: 2 },
  trackDone: { left: 0, backgroundColor: "#F97316" },
  trackPending: {
    right: 0,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderStyle: "dashed",
  },
  riderPin: { position: "absolute", top: 0, bottom: 0, width: 28, justifyContent: "center", alignItems: "center" },
  riderPulse: {
    position: "absolute",
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#F97316",
  },
  riderBubble: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#F97316", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6, shadowRadius: 6, elevation: 6,
  },
  waypoint: { position: "absolute", top: "50%", marginTop: -4, width: 8, height: 8, borderRadius: 4 },
  labelRow: {
    flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4,
  },
  labelText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#94a3b8" },
  riderCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  riderAvatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
  },
  riderInitial: { fontSize: 18, fontFamily: "Inter_700Bold" },
  riderInfo: { flex: 1, gap: 3 },
  riderName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" },
  riderMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  riderSubtext: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" },
  riderDot: { fontSize: 11, color: "#9CA3AF" },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
  },
});
