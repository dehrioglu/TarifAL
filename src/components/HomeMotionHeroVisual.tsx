import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

const stages: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}> = [
  { icon: 'home-outline', label: 'Evde' },
  { icon: 'basket-outline', label: 'Sepet' },
  { icon: 'restaurant-outline', label: 'Sofra' },
];

export function HomeMotionHeroVisual() {
  const progress = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      delay: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 3600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [entrance, progress]);

  const sparkleStyle = useMemo(
    () => ({
      opacity: progress.interpolate({
        inputRange: [0, 0.18, 0.48, 0.72, 1],
        outputRange: [0.35, 1, 0.48, 0.9, 0.35],
      }),
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [2, -4, 2],
          }),
        },
        {
          rotate: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '18deg'],
          }),
        },
      ],
    }),
    [progress],
  );

  return (
    <Animated.View
      style={[
        styles.visual,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.visualHeader}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
          <Text style={styles.aiBadgeText}>AI akışı hazır</Text>
        </View>
        <Animated.View style={sparkleStyle}>
          <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
        </Animated.View>
      </View>

      <View style={styles.flowRow}>
        {stages.map((stage, index) => {
          const start = index * 0.22;
          const peak = start + 0.2;
          const end = Math.min(1, peak + 0.22);
          const pulse = progress.interpolate({
            inputRange: [0, start, peak, end, 1],
            outputRange: [1, 1, 1.08, 1, 1],
          });
          const opacity = progress.interpolate({
            inputRange: [0, start, peak, end, 1],
            outputRange: [0.62, 0.62, 1, 0.72, 0.62],
          });

          return (
            <View key={stage.label} style={styles.stageGroup}>
              {index > 0 ? (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                  <Ionicons name="chevron-forward" size={13} color="#FFB58C" />
                </View>
              ) : null}
              <Animated.View style={[styles.stage, { opacity, transform: [{ scale: pulse }] }]}>
                <View style={styles.stageIcon}>
                  <Ionicons name={stage.icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.stageLabel}>{stage.label}</Text>
              </Animated.View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  visual: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: 'rgba(255,255,255,0.82)',
    padding: 12,
    gap: 11,
  },
  visualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFF8F4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stageIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  connector: {
    width: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  connectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFD1B7',
  },
});
