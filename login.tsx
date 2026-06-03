import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
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

const DEMO_ACCOUNTS = [
  { name: "Rahul Sharma",   email: "rahul.sharma@gmail.com"   },
  { name: "Priya Patel",    email: "priya.patel@gmail.com"    },
  { name: "Arjun Nair",     email: "arjun.nair@gmail.com"     },
  { name: "Sneha Kapoor",   email: "sneha.kapoor@gmail.com"   },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const googleScale = useRef(new Animated.Value(1)).current;
  const otpScale   = useRef(new Animated.Value(1)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 1600));
    const acc = DEMO_ACCOUNTS[Math.floor(Math.random() * DEMO_ACCOUNTS.length)];
    await signInWithGoogle(acc.name, acc.email);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)/");
  };

  const handleOTP = async () => {
    const clean = phone.replace(/[^0-9]/g, "");
    if (!/^[6-9][0-9]{9}$/.test(clean)) {
      setError("Enter a valid 10-digit Indian mobile number");
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError("");
    setOtpLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 600));
    setOtpLoading(false);
    router.push({ pathname: "/(auth)/otp", params: { phone: clean } });
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[
            s.content,
            { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 60), paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={s.brand}>
            <LinearGradient colors={[colors.primary, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logoBox}>
              <Ionicons name="bag-handle" size={34} color="#fff" />
            </LinearGradient>
            <Text style={[s.appName, { color: colors.foreground }]}>BazarLink</Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>
              Your neighbourhood marketplace
            </Text>
          </View>

          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.foreground }]}>Welcome back</Text>
            <Text style={[s.cardSub, { color: colors.mutedForeground }]}>Sign in to continue shopping</Text>

            {/* Google CTA — primary */}
            <Animated.View style={{ transform: [{ scale: googleScale }] }}>
              <TouchableOpacity
                style={[s.googleBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={handleGoogle}
                onPressIn={() => Animated.spring(googleScale, { toValue: 0.97, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(googleScale, { toValue: 1, useNativeDriver: true }).start()}
                disabled={googleLoading}
                activeOpacity={1}
              >
                {googleLoading
                  ? <ActivityIndicator size="small" color="#EA4335" />
                  : <AntDesign name="google" size={22} color="#EA4335" />}
                <Text style={[s.googleText, { color: colors.foreground }]}>
                  {googleLoading ? "Connecting to Gmail…" : "Continue with Google"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[s.dividerLabel, { color: colors.mutedForeground }]}>or use mobile</Text>
              <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Mobile input */}
            <Text style={[s.fieldLabel, { color: colors.mutedForeground }]}>MOBILE NUMBER (OPTIONAL)</Text>
            <Animated.View
              style={[
                s.inputRow,
                { borderColor: focused ? colors.primary : colors.border, backgroundColor: colors.background },
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <View style={[s.codeBox, { borderRightColor: colors.border }]}>
                <Text style={[s.codeText, { color: colors.foreground }]}>+91</Text>
              </View>
              <TextInput
                style={[s.input, { color: colors.foreground }]}
                value={phone}
                onChangeText={(t) => { setPhone(t.replace(/[^0-9]/g, "").slice(0, 10)); if (error) setError(""); }}
                placeholder="10-digit number"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                returnKeyType="done"
                onSubmitEditing={handleOTP}
              />
              {phone.length === 10 && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: 12 }} />
              )}
            </Animated.View>
            {error ? <Text style={[s.error, { color: colors.destructive }]}>{error}</Text> : null}

            <Animated.View style={{ transform: [{ scale: otpScale }] }}>
              <TouchableOpacity
                style={[s.otpBtn, { borderColor: colors.primary }]}
                onPress={handleOTP}
                onPressIn={() => Animated.spring(otpScale, { toValue: 0.97, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(otpScale, { toValue: 1, useNativeDriver: true }).start()}
                disabled={otpLoading}
                activeOpacity={1}
              >
                {otpLoading
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Text style={[s.otpText, { color: colors.primary }]}>Send OTP via SMS</Text>}
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Text style={[s.terms, { color: colors.mutedForeground }]}>
            By continuing you agree to our Terms of Service & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 0 },
  brand: { alignItems: "center", marginBottom: 32 },
  logoBox: { width: 76, height: 76, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  appName: { fontSize: 30, fontFamily: "Inter_700Bold", marginBottom: 4 },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular" },
  card: {
    borderRadius: 20, borderWidth: 1,
    padding: 24, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -8 },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 12, borderWidth: 1.5, borderRadius: 14, paddingVertical: 16,
  },
  googleText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: -4 },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 12, overflow: "hidden" },
  codeBox: { paddingHorizontal: 14, paddingVertical: 16, borderRightWidth: 1 },
  codeText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  input: {
    flex: 1, fontSize: 17, fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 14, paddingVertical: 16, letterSpacing: 2,
  },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -4 },
  otpBtn: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  otpText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  terms: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 20 },
});
