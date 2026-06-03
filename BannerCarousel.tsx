import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32;
const BANNER_HEIGHT = 180;

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradientColors: [string, string];
  icon: string;
}

const BANNERS: Banner[] = [
  {
    id: "1",
    title: "Mega Sale",
    subtitle: "Up to 50% off on electronics",
    badge: "TODAY ONLY",
    gradientColors: ["#F97316", "#EA580C"],
    icon: "flash",
  },
  {
    id: "2",
    title: "Fresh Daily",
    subtitle: "Groceries delivered in 30 mins",
    badge: "FREE DELIVERY",
    gradientColors: ["#16A34A", "#15803D"],
    icon: "leaf",
  },
  {
    id: "3",
    title: "Fashion Week",
    subtitle: "New arrivals from top brands",
    badge: "NEW COLLECTION",
    gradientColors: ["#7C3AED", "#6D28D9"],
    icon: "shirt",
  },
  {
    id: "4",
    title: "Tech Deals",
    subtitle: "Smartphones, laptops & more",
    badge: "EMI AVAILABLE",
    gradientColors: ["#0284C7", "#0369A1"],
    icon: "hardware-chip",
  },
];

function BannerItem({ item }: { item: Banner }) {
  return (
    <View style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT, paddingRight: 0 }}>
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>{item.badge}</Text>
        </View>
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextBlock}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            <TouchableOpacity style={styles.shopNowBtn}>
              <Text style={styles.shopNowText}>Shop Now</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerIconCircle}>
            <Ionicons name={item.icon as any} size={52} color="rgba(255,255,255,0.4)" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function BannerCarousel() {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<Banner>>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
  }, []);

  useEffect(() => {
    startAuto();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [startAuto]);

  const onMomentumScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveIndex(idx);
  };

  const onScrollBeginDrag = () => {
    if (autoRef.current) clearInterval(autoRef.current);
  };

  const onScrollEndDrag = () => {
    startAuto();
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatRef}
        data={BANNERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BannerItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH,
          offset: BANNER_WIDTH * index,
          index,
        })}
        style={{ borderRadius: 16 }}
        contentContainerStyle={{ gap: 0 }}
        scrollEnabled={BANNERS.length > 0}
      />
      <View style={styles.dotsRow}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIndex ? colors.primary : colors.border,
                width: i === activeIndex ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16 },
  bannerGradient: {
    height: BANNER_HEIGHT,
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  bannerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.8,
  },
  bannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flex: 1,
  },
  bannerTextBlock: { flex: 1 },
  bannerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 34,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 14,
    lineHeight: 18,
  },
  shopNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  shopNowText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  bannerIconCircle: {
    position: "absolute",
    right: 16,
    bottom: 16,
    opacity: 0.6,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    transition: "width 0.3s",
  } as any,
});
