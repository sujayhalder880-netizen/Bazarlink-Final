import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const OTP_LENGTH = 6;
const RESEND_SECS = 60;
const DEMO_OTP = "123456";

export default function OTPScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signIn } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECS);
  const [verified, setVerified] = useState(false);
  const inputs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const successScale = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => inputs.current[0]?.focus(), 400);
    Animated.timing(progressAnim, { toValue: 0, duration: RESEND_SECS * 1000, useNativeDriver: false }).start();
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (error) setError("");
    if (digit && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
    if (digit && index === OTP_LENGTH - 1) {
      const completed = [...newOtp.slice(0, OTP_LENGTH - 1), digit];
      if (completed.every((d) => d !== "")) setTimeout(() => handleVerify(completed.join("")), 150);
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async (code: string = otp.join("")) => {
    if (code.length < OTP_LENGTH) {
      setError("Enter all 6 digits. Demo OTP: 123456");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 900));

    setVerified(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(successScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }).start();
    await new Promise((r) => setTimeout(r, 1300));
    await signIn(phone ?? "");
    router.replace("/(tabs)/");
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(RESEND_SECS);
    progressAnim.setValue(1);
    Animated.timing(progressAnim, { toValue: 0, duration: RESEND_SECS * 1000, useNativeDriver: false }).start();
    setOtp(Array(OTP_LENGTH).fill(""));
    inputs.current[0]?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const fillDemo = () => {
    const demoDigits = DEMO_OTP.split("");
    setOtp(demoDigits);
    setTimeout(() => handleVerify(DEMO_OTP), 100);
  };

  const allFilled = otp.every((d) => d !== "");

  if (verified) {
    return (
      <View style={[s.successOverlay, { backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ scale: successScale }], alignItems: "center" }}>
          <View style={[s.successCircle, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
          <Text style={[s.successTitle, { color: colors.foreground }]}>Verified!</Text>
          <Text style={[s.successSub, { color: colors.mutedForeground }]}>Welcome to BazarLink</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20), paddingBottom: insets.bottom + 40 }]}>
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
      </TouchableOpacity>

      <View style={s.header}>
        <Text style={[s.title, { color: colors.foreground }]}>Verify your{"\n"}number</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          We sent a 6-digit OTP to{" "}
          <Text style={[s.phoneSpan, { color: colors.foreground }]}>+91 {phone}</Text>
        </Text>
      </View>

      {/* Demo hint banner */}
      <TouchableOpacity
        style={[s.demoHint, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
        onPress={fillDemo}
        activeOpacity={0.8}
      >
        <Ionicons name="flash-circle" size={16} color={colors.primary} />
        <Text style={[s.demoText, { color: colors.accent }]}>
          Demo OTP: <Text style={{ fontFamily: "Inter_700Bold" }}>123456</Text> — tap to auto-fill
        </Text>
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={[s.progressBar, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            s.progressFill,
            {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            },
          ]}
        />
      </View>

      {/* OTP boxes */}
      <View style={s.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => (inputs.current[i] = r)}
            style={[
              s.otpBox,
              {
                borderColor: digit ? colors.primary : colors.border,
                backgroundColor: digit ? colors.secondary : colors.card,
                color: colors.foreground,
              },
            ]}
            value={digit}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {error ? (
        <Text style={[s.errorText, { color: colors.destructive }]}>{error}</Text>
      ) : null}

      <View style={s.resendRow}>
        <Text style={[s.resendLabel, { color: colors.mutedForeground }]}>Didn't receive OTP?</Text>
        {timer > 0 ? (
          <Text style={[s.timerText, { color: colors.mutedForeground }]}> Resend in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={[s.resendBtn, { color: colors.primary }]}> Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => handleVerify()}
        onPressIn={() => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()}
        disabled={loading || !allFilled}
        activeOpacity={1}
        style={{ borderRadius: 14, overflow: "hidden", marginTop: 8 }}
      >
        <LinearGradient
          colors={!allFilled || loading ? ["#D1D5DB", "#D1D5DB"] : [colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.btnInner}
        >
          <Text style={s.btnText}>{loading ? "Verifying..." : "Verify & Continue"}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  header: { marginTop: 28, marginBottom: 20 },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", lineHeight: 38, marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  phoneSpan: { fontFamily: "Inter_700Bold" },
  demoHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  demoText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  progressBar: { height: 3, borderRadius: 2, marginBottom: 24, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 } as any,
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  otpBox: {
    flex: 1,
    height: 60,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 14 },
  resendRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, marginTop: 4 },
  resendLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resendBtn: { fontSize: 14, fontFamily: "Inter_700Bold" },
  timerText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  btnInner: { paddingVertical: 18, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  successOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
