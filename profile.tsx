import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface QuickLink {
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  bg: string;
}

const QUICK_LINKS: QuickLink[] = [
  { icon: "location", label: "Saved Addresses", subtitle: "Manage delivery addresses", color: "#2563EB", bg: "#DBEAFE" },
  { icon: "card", label: "Payment Methods", subtitle: "UPI, cards & wallets", color: "#16A34A", bg: "#DCFCE7" },
  { icon: "bag", label: "Wishlist", subtitle: "Saved items", color: "#9333EA", bg: "#F3E8FF" },
  { icon: "help-circle", label: "Help & Support", subtitle: "FAQs and contact", color: "#F97316", bg: "#FFF7ED" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateUser({ name: name.trim(), email: email.trim() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      await signOut();
      router.replace("/(auth)/login");
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100) }}
      >
        {/* Hero header */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            s.hero,
            { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 24) },
          ]}
        >
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>
              {user?.avatarInitials ?? "BU"}
            </Text>
          </View>
          {!editing ? (
            <>
              <Text style={s.heroName}>{user?.name ?? "BazarLink User"}</Text>
              <Text style={s.heroPhone}>+91 {user?.phone}</Text>
              {user?.email ? (
                <Text style={s.heroEmail}>{user.email}</Text>
              ) : null}
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => {
                  setEditing(true);
                  setName(user?.name ?? "");
                  setEmail(user?.email ?? "");
                }}
              >
                <Ionicons name="pencil" size={14} color="#fff" />
                <Text style={s.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={s.editForm}>
              <TextInput
                style={[s.editInput, { color: colors.foreground, backgroundColor: "rgba(255,255,255,0.9)" }]}
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />
              <TextInput
                style={[s.editInput, { color: colors.foreground, backgroundColor: "rgba(255,255,255,0.9)" }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address (optional)"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={s.editBtns}>
                <TouchableOpacity
                  style={[s.editActionBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
                  onPress={() => setEditing(false)}
                >
                  <Text style={s.editBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.editActionBtn, { backgroundColor: "rgba(255,255,255,0.9)" }]}
                  onPress={handleSave}
                >
                  <Text style={[s.editBtnText, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Stats row */}
        <View style={[s.statsRow, { borderBottomColor: colors.border }]}>
          {[
            { label: "Orders", value: "5" },
            { label: "Wishlist", value: "12" },
            { label: "Reviews", value: "3" },
          ].map((stat) => (
            <View key={stat.label} style={s.statItem}>
              <Text style={[s.statValue, { color: colors.foreground }]}>
                {stat.value}
              </Text>
              <Text style={[s.statLabel, { color: colors.mutedForeground }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick links */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>
            Account
          </Text>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity
              key={link.label}
              style={[s.linkRow, { borderBottomColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[s.linkIcon, { backgroundColor: link.bg }]}>
                <Ionicons name={link.icon as any} size={20} color={link.color} />
              </View>
              <View style={s.linkText}>
                <Text style={[s.linkLabel, { color: colors.foreground }]}>
                  {link.label}
                </Text>
                <Text style={[s.linkSub, { color: colors.mutedForeground }]}>
                  {link.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <TouchableOpacity
            style={[s.signOutBtn, { borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 14,
  },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  heroName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 4,
  },
  heroPhone: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  heroEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  editBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  editForm: { width: "100%", gap: 10, marginTop: 10 },
  editInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  editBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  editActionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
    paddingLeft: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  linkIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: { flex: 1 },
  linkLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  linkSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 16,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#DC2626" },
});
