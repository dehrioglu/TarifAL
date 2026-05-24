import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { BrandLogo } from './BrandLogo';

type PremiumHeroCardProps = {
  title?: string;
  subtitle?: string;
  insight: string;
  onOpenSmartBasket: () => void;
  onOpenVision: () => void;
  onOpenToday: () => void;
  onOpenPantry: () => void;
};

export function PremiumHeroCard({
  title = 'Malzemeden sepete akıllı plan hazır ✨',
  subtitle = 'Lezzeti sizden, tarifi bizden',
  insight,
  onOpenSmartBasket,
  onOpenVision,
  onOpenToday,
  onOpenPantry,
}: PremiumHeroCardProps) {
  const sparkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [sparkle]);

  const scale = sparkle.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const opacity = sparkle.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={styles.card}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <BrandLogo size={68} />
          <View style={styles.brandCopy}>
            <Text style={styles.brandSlogan}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Animated.View style={{ transform: [{ scale }], opacity }}>
            <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
          </Animated.View>
          <Text style={styles.badgeText}>AI aktif</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.insightBox}>
        <Ionicons name="analytics-outline" size={17} color={theme.colors.primary} />
        <Text style={styles.insightText}>{insight}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onOpenSmartBasket} activeOpacity={0.86} style={styles.primaryAction}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.primaryText}>Akıllı Sepet Oluştur</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenPantry} activeOpacity={0.86} style={styles.secondaryAction}>
          <Text style={styles.secondaryText}>Evde Ne Var?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.linkRow}>
        <TouchableOpacity onPress={onOpenVision} activeOpacity={0.78} style={styles.todayLink}>
          <Ionicons name="camera-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.todayLinkText}>Dolabımı Tara</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenToday} activeOpacity={0.78} style={styles.todayLink}>
          <Text style={styles.todayLinkText}>Bugün Ne Pişirsem?</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 28,
    backgroundColor: '#FFF4EC',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 18,
    overflow: 'hidden',
    ...theme.orangeShadow,
    shadowOpacity: 0.1,
  },
  glowOne: {
    position: 'absolute',
    right: -42,
    top: -38,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255, 90, 0, 0.12)',
  },
  glowTwo: {
    position: 'absolute',
    left: -48,
    bottom: -54,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandCopy: {
    flex: 1,
  },
  brandSlogan: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  badge: {
    minHeight: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  insightBox: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.76)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  insightText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1.15,
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  linkRow: {
    alignSelf: 'flex-start',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  todayLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  todayLinkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
