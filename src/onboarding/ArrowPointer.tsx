import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { theme } from '../constants/theme';

type ArrowDirection = 'up' | 'down' | 'left' | 'right';

type ArrowPointerProps = {
  x: number;
  y: number;
  direction: ArrowDirection;
};

const isVertical = (direction: ArrowDirection) => direction === 'up' || direction === 'down';

export function ArrowPointer({ x, y, direction }: ArrowPointerProps) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [motion]);

  const translate = motion.interpolate({
    inputRange: [0, 1],
    outputRange: direction === 'up' || direction === 'left' ? [0, -5] : [0, 5],
  });

  const transform = isVertical(direction) ? [{ translateY: translate }] : [{ translateX: translate }];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        isVertical(direction) ? styles.verticalRoot : styles.horizontalRoot,
        { left: x, top: y, transform },
      ]}
    >
      {direction === 'up' ? (
        <>
          <View style={styles.upHead}>
            <View style={[styles.headLine, styles.headLeftUp]} />
            <View style={[styles.headLine, styles.headRightUp]} />
          </View>
          <View style={styles.verticalStem} />
          <View style={styles.dot} />
        </>
      ) : null}
      {direction === 'down' ? (
        <>
          <View style={styles.dot} />
          <View style={styles.verticalStem} />
          <View style={styles.downHead}>
            <View style={[styles.headLine, styles.headLeftDown]} />
            <View style={[styles.headLine, styles.headRightDown]} />
          </View>
        </>
      ) : null}
      {direction === 'left' ? (
        <>
          <View style={styles.leftHead}>
            <View style={[styles.headLine, styles.headLeftSideTop]} />
            <View style={[styles.headLine, styles.headLeftSideBottom]} />
          </View>
          <View style={styles.horizontalStem} />
          <View style={styles.dot} />
        </>
      ) : null}
      {direction === 'right' ? (
        <>
          <View style={styles.dot} />
          <View style={styles.horizontalStem} />
          <View style={styles.rightHead}>
            <View style={[styles.headLine, styles.headRightSideTop]} />
            <View style={[styles.headLine, styles.headRightSideBottom]} />
          </View>
        </>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalRoot: {
    width: 34,
    height: 58,
  },
  horizontalRoot: {
    width: 58,
    height: 34,
    flexDirection: 'row',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 8,
    elevation: 4,
  },
  verticalStem: {
    width: 4,
    height: 32,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  horizontalStem: {
    width: 32,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  upHead: {
    width: 26,
    height: 12,
    marginTop: -3,
  },
  downHead: {
    width: 26,
    height: 12,
    marginBottom: -3,
  },
  leftHead: {
    width: 12,
    height: 26,
    marginLeft: -3,
  },
  rightHead: {
    width: 12,
    height: 26,
    marginRight: -3,
  },
  headLine: {
    position: 'absolute',
    width: 16,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  headLeftUp: {
    left: 3,
    top: 2,
    transform: [{ rotate: '38deg' }],
  },
  headRightUp: {
    right: 3,
    top: 2,
    transform: [{ rotate: '-38deg' }],
  },
  headLeftDown: {
    left: 3,
    bottom: 2,
    transform: [{ rotate: '-38deg' }],
  },
  headRightDown: {
    right: 3,
    bottom: 2,
    transform: [{ rotate: '38deg' }],
  },
  headLeftSideTop: {
    left: -1,
    top: 5,
    transform: [{ rotate: '-42deg' }],
  },
  headLeftSideBottom: {
    left: -1,
    bottom: 5,
    transform: [{ rotate: '42deg' }],
  },
  headRightSideTop: {
    right: -1,
    top: 5,
    transform: [{ rotate: '42deg' }],
  },
  headRightSideBottom: {
    right: -1,
    bottom: 5,
    transform: [{ rotate: '-42deg' }],
  },
});
