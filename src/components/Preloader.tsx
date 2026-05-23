import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { BrandLogo } from './BrandLogo';

type PreloaderProps = {
  onDone: () => void;
};

export function Preloader({ onDone }: PreloaderProps) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1250,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(onDone, 1450);

    return () => clearTimeout(timer);
  }, [onDone, opacity, progress, scale]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <BrandLogo size={210} />
        <Text style={styles.title}>TarifAL</Text>
        <Text style={styles.subtitle}>AI şefin mutfağı hazırlıyor</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.screen.padding,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    width: '72%',
    height: 8,
    borderRadius: 4,
    marginTop: 24,
    backgroundColor: theme.colors.primarySoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
