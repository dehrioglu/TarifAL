import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type TarifALBotFabProps = {
  onPress: () => void;
};

export function TarifALBotFab({ onPress }: TarifALBotFabProps) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [float]);

  return (
    <Animated.View
      style={[
        styles.fabWrap,
        {
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="AI Şef’e sor"
        style={styles.fab}
      >
        <View style={styles.spark}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.text}>AI Şef</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    right: 18,
    bottom: 96,
    ...theme.orangeShadow,
  },
  fab: {
    minWidth: 72,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  spark: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
