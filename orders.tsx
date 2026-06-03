import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OrderTrackingSheet, { type OrderStatus, type TrackableOrder } from "@/components/OrderTrackingSheet";
import { useColors } from "@/hooks/useColors";

const ORDERS: TrackableOrder[] = [
  {
    id: "1",
    orderId: "BL-20260601-001",
    date: "1 Jun 2026",
    items: ["Stainless Steel Screws", "Door Hinges"],
    total: 1549,
    status: "Processing",
    itemCount: 2,
    address: "12, Pali Hill, Bandra West, Mumbai – 400 050",
    estimatedDelivery: "Today, 6:00 PM – 8:00 PM",
  },
  {
    id: "2",
    orderId: "BL-20260530-002",
    date: "30 May 2026",
    items: ["18mm BWR Plywood Sheet", "Wood Drill Bit Set"],
    total: 2699,
    status: "Shipped",
    itemCount: 2,
    address: "45, Link Road, Andheri West, Mumbai – 400 053",
    estimatedDelivery: "Today, 7:30 PM – 9:00 PM",
  },
  {
    id: "3",
    orderId: "BL-20260522-003",
    date: "22 May 2026",
    items: ["Fresh Vegetables Bundle", "Premium Tea"],
    total: 849,
    status: "Delivered",
    itemCount: 3,
    address: "8, Juhu Tara Road, Juhu, Mumbai – 400 049",
  },
  {
    id: "4",
    orderId: "BL-20260518-004",
    date: "18 May 2026",
    items: ["Casual Linen Shirt"],
    total: 699,
    status: "Delivered",
    itemCount: 1,
    address: "22, Napean Sea Road, Malabar Hill, Mumbai – 400 006",
  },
  {
    id: "5",
    orderId: "BL-20260510-005",
    date: "10 May 2026",
    items: ["Running Shoes Pro", "Sports Socks"],
    total: 2199,
    status: "Cancelled",
    itemCount: 2,
    address: "5, Carter Road, Bandra West, Mumbai – 400 050",
  },
];

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; icon: string }> = {
  Delivered:  { color: "#16A34A", bg: "#DCFCE7", icon: "checkmark-circle" },
  Processing: { color: "#D97706", bg: "#FEF3C7", icon: "time" },
  Shipped:    { color: "#2563EB", bg: "#DBEAFE", icon: "bicycle" },
  Cancelled:  { color: "#DC2626", bg: "#FEE2E2", icon: "close-circle" },
};

const FILTER_TABS: (OrderStatus | "All")[] = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const [filter, setFilter]           = useState<OrderStatus | "All">("All");
  const [trackingOrder, setTracking]  = useState<TrackableOrder | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);

  const displayed = filter === "All" ? ORDERS : ORDERS.filter((o) => o.status === filter);

  const openTracking = (order: TrackableOrder) => {
    setTracking(order);
    setTrackingOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <View style={[s.header, {
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }]}>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>My Orders</Text>
        <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
          {ORDERS.length} orders · tap any to track
        </Text>
      </View>

      {/* ─── Filter chips ─────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.filterRow, { borderBottomColor: colors.border }]}
        style={{ backgroundColor: colors.background, flexGrow: 0 }}
      >
        {FILTER_TABS.map((tab) => {
          const active = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              style={[
                s.filterTab,
                active && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text style={[
                s.filterTabText,
                {
                  color:      active ? colors.primary : colors.mutedForeground,
                  fontFamily: active ? "Inter_700Bold" : "Inter_500Medium",
                },
              ]}>
                {tab}
              </Text>
              {tab !== "All" && (
                <View style={[s.tabCount, { backgroundColor: active ? colors.primary : colors.border }]}>
                  <Text style={[s.tabCountText, { color: active ? "#fff" : colors.mutedForeground }]}>
                    {ORDERS.filter((o) => o.status === tab).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ─── Orders list ──────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {displayed.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="bag-outline" size={56} color={colors.border} />
            <Text style={[s.emptyTitle, { color: colors.foreground }]}>No orders here</Text>
            <Text style={[s.emptySub, { color: colors.mutedForeground }]}>
              Orders with this status will appear here
            </Text>
          </View>
        ) : (
          displayed.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const isActive = order.status === "Processing" || order.status === "Shipped";
            return (
              <TouchableOpacity
                key={order.id}
                style={[s.card, {
                  backgroundColor: colors.card,
                  borderColor: isActive ? colors.primary + "40" : colors.border,
                  borderWidth: isActive ? 1.5 : 1,
                }]}
                activeOpacity={0.85}
                onPress={() => openTracking(order)}
              >
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.orderId, { color: colors.foreground }]}>{order.orderId}</Text>
                    <Text style={[s.orderDate, { color: colors.mutedForeground }]}>
                      {order.date} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
                    <Text style={[s.statusText, { color: cfg.color }]}>{order.status}</Text>
                  </View>
                </View>

                <View style={[s.divider, { backgroundColor: colors.border }]} />

                <Text style={[s.itemsText, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {order.items.join(", ")}
                </Text>

                {/* Mini progress bar for active orders */}
                {isActive && (
                  <View style={s.progressWrap}>
                    <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
                      <View style={[
                        s.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: order.status === "Processing" ? "30%" : "70%",
                        },
                      ]} />
                    </View>
                    <Text style={[s.progressLabel, { color: colors.primary }]}>
                      {order.status === "Processing" ? "Confirmed • Packing…" : "Packed • Out for delivery"}
                    </Text>
                  </View>
                )}

                <View style={s.cardBottom}>
                  <Text style={[s.total, { color: colors.foreground }]}>
                    ₹{order.total.toLocaleString("en-IN")}
                  </Text>
                  <TouchableOpacity
                    style={[s.trackBtn, {
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive ? colors.secondary : "transparent",
                    }]}
                    onPress={() => openTracking(order)}
                  >
                    <Ionicons
                      name={isActive ? "navigate" : "eye-outline"}
                      size={14}
                      color={isActive ? colors.primary : colors.mutedForeground}
                    />
                    <Text style={[s.trackBtnText, {
                      color: isActive ? colors.primary : colors.mutedForeground,
                    }]}>
                      {isActive ? "Track Order" : "View Details"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ─── Tracking sheet (global overlay) ─────────────────── */}
      <OrderTrackingSheet
        order={trackingOrder}
        visible={trackingOpen}
        onClose={() => setTrackingOpen(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  header:        { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle:   { fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub:     { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  filterRow:     { paddingHorizontal: 12, gap: 0, borderBottomWidth: 1 },
  filterTab:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 14, gap: 6 },
  filterTabText: { fontSize: 14 },
  tabCount:      { minWidth: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  tabCountText:  { fontSize: 10, fontFamily: "Inter_700Bold" },
  list:          { padding: 16, gap: 12 },
  card:          { borderRadius: 16, padding: 16, gap: 10 },
  cardTop:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderId:       { fontSize: 14, fontFamily: "Inter_700Bold" },
  orderDate:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge:   { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  statusText:    { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  divider:       { height: 1 },
  itemsText:     { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressWrap:  { gap: 4 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill:  { height: 4, borderRadius: 2 },
  progressLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  cardBottom:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  total:         { fontSize: 16, fontFamily: "Inter_700Bold" },
  trackBtn:      { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  trackBtnText:  { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty:         { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle:    { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySub:      { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
