import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useDrawer } from "@/context/DrawerContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const DRAWER_W = Math.min(width * 0.78, 320);

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: "home", route: "/(tabs)/" },
  { label: "My Orders", icon: "list-circle", route: "/(tabs)/orders" },
  { label: "Profile", icon: "person-circle", route: "/(tabs)/profile" },
  { label: "Notifications", icon: "notifications", route: "/(tabs)/notifications" },
  { label: "Settings", icon: "settings", route: "/(tabs)/settings" },
];

export default function DrawerMenu() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isOpen, close } = useDrawer();
  const { user, signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  // Track true visibility so we can unmount when fully closed
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_W, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [isOpen]);

  // Fully unmounted when closed — zero chance of blocking touches
  if (!mounted && !isOpen) return null;

  const navigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    close();
    setTimeout(() => router.push(route as any), 230);
  };

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    close();
    await new Promise((r) => setTimeout(r, 250));
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      {/* Dimming backdrop */}
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "#000",
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.55],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer panel */}
      <Animated.View
        style={[
          s.drawer,
          { width: DRAWER_W, backgroundColor: colors.background, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{user?.avatarInitials ?? "BU"}</Text>
          </View>
          <Text style={s.userName}>{user?.name ?? "BazarLink User"}</Text>
          <Text style={s.userPhone}>
            {user?.loginMethod === "google"
              ? user?.email ?? "Google Account"
              : `+91 ${user?.phone ?? ""}`}
          </Text>
        </LinearGradient>

        <View style={s.navSection}>
          {NAV_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[s.navItem, { borderBottomColor: colors.border }]}
              onPress={() => navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[s.navIconBox, { backgroundColor: colors.muted }]}>
                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={[s.navLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[s.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={[s.version, { color: colors.mutedForeground }]}>BazarLink v1.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  userName: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 3 },
  userPhone: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  navSection: { flex: 1 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 14,
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  navLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  footer: { paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 1, gap: 12 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#FEF2F2",
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#DC2626" },
  version: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
});
