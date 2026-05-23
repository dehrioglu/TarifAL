import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { theme } from '../constants/theme';
import { TargetRect } from './types';

type SpotlightOverlayProps = {
  targetRect: TargetRect | null;
  screenWidth: number;
  screenHeight: number;
};

const OVERLAY_COLOR = 'rgba(11, 16, 32, 0.48)';
const SPOTLIGHT_PADDING = 10;

export function SpotlightOverlay({ targetRect, screenWidth, screenHeight }: SpotlightOverlayProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [pulse]);

  const paddedRect = useMemo(() => {
    if (!targetRect) {
      return null;
    }

    const x = Math.max(12, targetRect.x - SPOTLIGHT_PADDING);
    const y = Math.max(12, targetRect.y - SPOTLIGHT_PADDING);
    const right = Math.min(screenWidth - 12, targetRect.x + targetRect.width + SPOTLIGHT_PADDING);
    const bottom = Math.min(screenHeight - 12, targetRect.y + targetRect.height + SPOTLIGHT_PADDING);

    return {
      x,
      y,
      width: Math.max(44, right - x),
      height: Math.max(44, bottom - y),
    };
  }, [screenHeight, screenWidth, targetRect]);

  if (!paddedRect) {
    return <View pointerEvents="none" style={styles.fullOverlay} />;
  }

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.95],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.dim, { left: 0, top: 0, width: screenWidth, height: paddedRect.y }]} />
      <View
        style={[
          styles.dim,
          {
            left: 0,
            top: paddedRect.y + paddedRect.height,
            width: screenWidth,
            height: Math.max(0, screenHeight - (paddedRect.y + paddedRect.height)),
          },
        ]}
      />
      <View
        style={[
          styles.dim,
          { left: 0, top: paddedRect.y, width: paddedRect.x, height: paddedRect.height },
        ]}
      />
      <View
        style={[
          styles.dim,
          {
            left: paddedRect.x + paddedRect.width,
            top: paddedRect.y,
            width: Math.max(0, screenWidth - (paddedRect.x + paddedRect.width)),
            height: paddedRect.height,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.spotlight,
          {
            left: paddedRect.x,
            top: paddedRect.y,
            width: paddedRect.width,
            height: paddedRect.height,
            borderRadius: Math.min(28, Math.max(20, paddedRect.height / 3)),
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_COLOR,
  },
  dim: {
    position: 'absolute',
    backgroundColor: OVERLAY_COLOR,
  },
  spotlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.46,
    shadowRadius: 18,
    elevation: 10,
  },
});
