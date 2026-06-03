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

import { useColors } from "@/hooks/useColors";

type NotifType = "order" | "offer" | "alert" | "info";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL: Notif[] = [
  {
    id: "1",
    type: "order",
    title: "Order Delivered!",
    body: "Your order #BL-20260522-003 has been successfully delivered.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "2",
    type: "offer",
    title: "Weekend Sale - 50% OFF",
    body: "Exclusive offer on electronics! Shop this weekend and save big.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "order",
    title: "Order Shipped",
    body: "Your order #BL-20260528-002 is on its way! Track it now.",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "offer",
    title: "New Arrivals in Fashion",
    body: "Check out the latest collection from top brands. Fresh styles just dropped.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "5",
    type: "alert",
    title: "Price Drop Alert",
    body: "Smart Watch Series 5 you were eyeing just dropped to ₹2,499!",
    time: "2 days ago",
    read: true,
  },
  {
    id: "6",
    type: "info",
    title: "Account Verified",
    body: "Your BazarLink account has been successfully verified. Happy shopping!",
    time: "3 days ago",
    read: true,
  },
];

const TYPE_CONFIG: Record<NotifType, { icon: string; bg: string; color: string }> = {
  order: { icon: "bag-check", bg: "#DCFCE7", color: "#16A34A" },
  offer: { icon: "pricetag", bg: "#FFF7ED", color: "#F97316" },
  alert: { icon: "notifications", bg: "#FEF3C7", color: "#D97706" },
  info: { icon: "information-circle", bg: "#DBEAFE", color: "#2563EB" },
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          s.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={[s.unreadLabel, { color: colors.mutedForeground }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[s.markAllText, { color: colors.primary }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          s.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {notifs.map((notif) => {
          const cfg = TYPE_CONFIG[notif.type];
          return (
            <TouchableOpacity
              key={notif.id}
              onPress={() => markRead(notif.id)}
              style={[
                s.card,
                {
                  backgroundColor: notif.read ? colors.background : colors.secondary,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[s.iconBox, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
              </View>
              <View style={s.content}>
                <View style={s.topRow}>
                  <Text
                    style={[
                      s.title,
                      {
                        color: colors.foreground,
                        fontFamily: notif.read ? "Inter_500Medium" : "Inter_700Bold",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {notif.title}
                  </Text>
                  {!notif.read && (
                    <View
                      style={[s.unreadDot, { backgroundColor: colors.primary }]}
                    />
                  )}
                </View>
                <Text
                  style={[s.body, { color: colors.mutedForeground }]}
                  numberOfLines={2}
                >
                  {notif.body}
                </Text>
                <Text style={[s.time, { color: colors.mutedForeground }]}>
                  {notif.time}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  unreadLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  markAllText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 2 },
  card: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  content: { flex: 1, gap: 3 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { flex: 1, fontSize: 14, lineHeight: 20 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6, flexShrink: 0 },
  body: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
