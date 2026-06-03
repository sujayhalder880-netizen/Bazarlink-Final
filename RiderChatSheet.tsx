import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = Math.min(SCREEN_H * 0.82, 620);

interface Message {
  id: string;
  from: "user" | "rider" | "system";
  text: string;
  time: string;
}

const QUICK_REPLIES = [
  "Where are you?",
  "ETA?",
  "Please ring bell 🔔",
  "Deliver to guard",
  "Can you hurry?",
];

const RIDER_RESPONSES: Record<string, string> = {
  "Where are you?":       "I'm near Bandra station signal — just 1.8 km away! Coming fast 🏍️",
  "ETA?":                 "Around 8–10 more minutes, sir! A bit of traffic near the junction 🙏",
  "Please ring bell 🔔":  "Sure, I'll ring the bell as soon as I reach your building 🔔",
  "Deliver to guard":     "No problem! I'll hand it over to the guard and take a signature 📦",
  "Can you hurry?":       "I'm going as fast as I safely can, sir! Almost there 🏍️💨",
  __default__:            "On my way! Will reach you in about 10 minutes 🙏",
};

function now() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -5, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue:  0, duration: 280, useNativeDriver: true }),
          Animated.delay(420),
        ])
      );
    const a = anim(d1, 0);
    const b = anim(d2, 160);
    const c = anim(d3, 320);
    a.start(); b.start(); c.start();
    return () => { a.stop(); b.stop(); c.stop(); };
  }, []);

  return (
    <View style={ti.bubble}>
      {[d1, d2, d3].map((dot, i) => (
        <Animated.View key={i} style={[ti.dot, { transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  );
}

const ti = StyleSheet.create({
  bubble: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#F1F5F9", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14,
    alignSelf: "flex-start", marginLeft: 52,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#94A3B8" },
});

interface Props {
  visible: boolean;
  onClose: () => void;
  riderName?: string;
  orderId?: string;
}

export default function RiderChatSheet({ visible, onClose, riderName = "Rajesh Kumar", orderId }: Props) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const slideAnim   = useRef(new Animated.Value(SHEET_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted]     = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const msgId   = useRef(0);

  const makeId = () => String(++msgId.current);

  // Initialise with system message + rider greeting when first opened
  useEffect(() => {
    if (visible && messages.length === 0) {
      setMessages([
        {
          id: makeId(),
          from: "system",
          text: `Chat with your delivery partner for order ${orderId ?? ""}. Messages are simulated for demo.`,
          time: now(),
        },
        {
          id: makeId(),
          from: "rider",
          text: `Hello! I'm Rajesh, your delivery partner 🙏 I have your order and I'm on my way!`,
          time: now(),
        },
      ]);
    }
  }, [visible]);

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

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: makeId(), from: "user", text: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    // Simulate rider typing then responding
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }, 600);

    const delay = 1400 + Math.random() * 800;
    setTimeout(() => {
      setTyping(false);
      const reply = RIDER_RESPONSES[text.trim()] ?? RIDER_RESPONSES.__default__;
      const riderMsg: Message = { id: makeId(), from: "rider", text: reply, time: now() };
      setMessages((prev) => [...prev, riderMsg]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }, delay + 600);
  }, []);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, {
          backgroundColor: "#000",
          opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
        }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, {
        backgroundColor: colors.background,
        height: SHEET_H,
        transform: [{ translateY: slideAnim }],
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
      }]}>
        {/* ─── Header ────────────────────────────────── */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.header}
        >
          <TouchableOpacity onPress={onClose} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <View style={s.headerAvatar}>
              <Text style={s.headerInitial}>{riderName[0]}</Text>
              <View style={s.onlineDot} />
            </View>
            <View>
              <Text style={s.headerName}>{riderName}</Text>
              <Text style={s.headerSub}>Delivery Partner · Online</Text>
            </View>
          </View>
          <TouchableOpacity style={s.callPill}>
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={s.callText}>Call</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ─── Messages ──────────────────────────────── */}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            style={{ flex: 1 }}
            contentContainerStyle={s.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={typing ? <TypingIndicator /> : null}
            renderItem={({ item: msg }) => {
              if (msg.from === "system") {
                return (
                  <View style={s.systemMsg}>
                    <Ionicons name="information-circle" size={13} color="#94A3B8" />
                    <Text style={s.systemText}>{msg.text}</Text>
                  </View>
                );
              }
              const isUser = msg.from === "user";
              return (
                <View style={[s.msgRow, isUser && s.msgRowUser]}>
                  {!isUser && (
                    <View style={s.riderAvatar}>
                      <Text style={s.riderAvatarText}>{riderName[0]}</Text>
                    </View>
                  )}
                  <View style={[
                    s.bubble,
                    isUser
                      ? [s.bubbleUser, { backgroundColor: colors.primary }]
                      : [s.bubbleRider, { backgroundColor: "#F1F5F9" }],
                  ]}>
                    <Text style={[s.bubbleText, { color: isUser ? "#fff" : "#111827" }]}>{msg.text}</Text>
                    <Text style={[s.bubbleTime, { color: isUser ? "rgba(255,255,255,0.65)" : "#94A3B8" }]}>{msg.time}</Text>
                  </View>
                </View>
              );
            }}
          />

          {/* ─── Quick replies ──────────────────────── */}
          {!typing && (
            <View style={s.quickRow}>
              {QUICK_REPLIES.map((qr) => (
                <TouchableOpacity
                  key={qr}
                  style={[s.quickChip, { borderColor: colors.primary, backgroundColor: colors.secondary }]}
                  onPress={() => sendMessage(qr)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.quickText, { color: colors.primary }]}>{qr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ─── Input bar ─────────────────────────── */}
          <View style={[s.inputBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <TextInput
              style={[s.textInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message…"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="send"
              onSubmitEditing={() => { if (input.trim()) sendMessage(input); }}
              multiline={false}
            />
            <TouchableOpacity
              style={[s.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.border }]}
              onPress={() => { if (input.trim()) sendMessage(input); }}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  backBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  headerInitial: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 5.5,
    backgroundColor: "#4ADE80", borderWidth: 2, borderColor: "#F97316",
  },
  headerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub:  { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  callPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  callText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  msgList: { paddingVertical: 16, paddingHorizontal: 16, gap: 10 },
  systemMsg: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "center", backgroundColor: "#F8FAFC",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 4,
  },
  systemText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", flex: 1 },
  msgRow:     { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { justifyContent: "flex-end" },
  riderAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#FFF7ED", justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  riderAvatarText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#F97316" },
  bubble: { maxWidth: "75%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  bubbleUser:  { borderBottomRightRadius: 4 },
  bubbleRider: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  quickRow: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  quickChip: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  quickText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputBar: {
    flexDirection: "row", alignItems: "center",
    gap: 10, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1, borderRadius: 22, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
  },
});
