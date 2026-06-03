import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offerAlerts, setOfferAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      await signOut();
      router.replace("/(auth)/login");
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
        onPress: async () => { await signOut(); router.replace("/(auth)/login"); },
      },
    ]);
  };

  const handleExportSource = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Export Source Code",
      "To download the full BazarLink source code as a ZIP:\n\n1. Open the Replit project\n2. Run in terminal:\n\n  pnpm run export-zip\n\nThis creates bazarlink-source.zip at the project root, ready to download.",
      [{ text: "Got it", style: "default" }]
    );
  };

  type SectionItem = {
    id: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    label: string;
    subtitle?: string;
    type: "toggle" | "nav" | "action";
    getValue?: () => boolean;
    onToggle?: (v: boolean) => void;
    onPress?: () => void;
    danger?: boolean;
  };

  const sections: { title: string; items: SectionItem[] }[] = [
    {
      title: "Notifications",
      items: [
        {
          id: "push", icon: "notifications", iconColor: "#F97316", iconBg: "#FFF7ED",
          label: "Push Notifications", subtitle: "All app alerts",
          type: "toggle", getValue: () => pushNotifs,
          onToggle: (v) => { setPushNotifs(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
        },
        {
          id: "orders", icon: "bag", iconColor: "#16A34A", iconBg: "#DCFCE7",
          label: "Order Updates", subtitle: "Delivery & status alerts",
          type: "toggle", getValue: () => orderUpdates,
          onToggle: (v) => { setOrderUpdates(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
        },
        {
          id: "offers", icon: "pricetag", iconColor: "#9333EA", iconBg: "#F3E8FF",
          label: "Offer Alerts", subtitle: "Deals and promotions",
          type: "toggle", getValue: () => offerAlerts,
          onToggle: (v) => { setOfferAlerts(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          id: "dark", icon: "moon", iconColor: "#2563EB", iconBg: "#DBEAFE",
          label: "Dark Mode", subtitle: "Switch to dark theme",
          type: "toggle", getValue: () => darkMode,
          onToggle: (v) => { setDarkMode(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
        },
      ],
    },
    {
      title: "Developer",
      items: [
        {
          id: "export", icon: "download", iconColor: "#0284C7", iconBg: "#E0F2FE",
          label: "Export Source Code", subtitle: "Download full project as ZIP",
          type: "action", onPress: handleExportSource,
        },
      ],
    },
    {
      title: "Privacy & Legal",
      items: [
        {
          id: "privacy", icon: "shield-checkmark", iconColor: "#16A34A", iconBg: "#DCFCE7",
          label: "Privacy Policy", type: "nav",
        },
        {
          id: "terms", icon: "document-text", iconColor: "#2563EB", iconBg: "#DBEAFE",
          label: "Terms of Service", type: "nav",
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          id: "rate", icon: "star", iconColor: "#D97706", iconBg: "#FEF3C7",
          label: "Rate BazarLink", type: "nav",
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          id: "version", icon: "information-circle", iconColor: "#6B7280", iconBg: "#F3F4F6",
          label: "App Version", subtitle: "1.0.0 (build 1)",
          type: "nav",
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[s.header, {
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }]}>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <Text style={[s.headerSub, { color: colors.mutedForeground }]}>BazarLink · v1.0.0</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100) }]}
      >
        {sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
            <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={s.row}
                    activeOpacity={item.type === "toggle" ? 1 : 0.7}
                    onPress={item.type !== "toggle" ? item.onPress : undefined}
                  >
                    <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
                      <Ionicons name={item.icon as any} size={19} color={item.iconColor} />
                    </View>
                    <View style={s.rowText}>
                      <Text style={[s.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                      {item.subtitle && (
                        <Text style={[s.rowSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
                      )}
                    </View>
                    {item.type === "toggle" ? (
                      <Switch
                        value={item.getValue?.() ?? false}
                        onValueChange={item.onToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={Platform.OS === "android" ? "#fff" : undefined}
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                    )}
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && (
                    <View style={[s.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[s.signOutBtn, { borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  content: { padding: 16, gap: 4 },
  section: { marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  divider: { height: 1, marginLeft: 62 },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1.5, borderRadius: 12, paddingVertical: 15, marginTop: 8, marginBottom: 8,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#DC2626" },
});
