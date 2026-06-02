import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type TarifALServiceCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  cta: string;
  accent?: 'orange' | 'navy' | 'green';
  delay?: number;
  onPress: () => void;
};

export function TarifALServiceCard({
  icon,
  title,
  description,
  cta,
  accent = 'orange',
  delay = 0,
  onPress,
}: TarifALServiceCardProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 460,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const iconLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay + 900),
        Animated.timing(iconFloat, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(iconFloat, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1400),
      ]),
    );

    iconLoop.start();

    return () => {
      iconLoop.stop();
    };
  }, [delay, entrance, iconFloat]);

  const animatePress = (toValue: number) => {
    Animated.spring(pressScale, {
      toValue,
      speed: 24,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
          { scale: pressScale },
        ],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => animatePress(0.975)}
        onPressOut={() => animatePress(1)}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={cta}
        style={styles.card}
      >
        <Animated.View
          style={[
            styles.icon,
            accent === 'navy' && styles.navyIcon,
            accent === 'green' && styles.greenIcon,
            {
              transform: [
                {
                  translateY: iconFloat.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={21}
            color={accent === 'navy' ? theme.colors.text : accent === 'green' ? theme.colors.success : theme.colors.primary}
          />
        </Animated.View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.ctaRow}>
          <Text style={styles.cta}>{cta}</Text>
          <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 190,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    ...theme.shadow,
    shadowOpacity: 0.035,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navyIcon: {
    backgroundColor: '#EEF1F7',
  },
  greenIcon: {
    backgroundColor: '#ECFDF3',
  },
  title: {
    marginTop: 13,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    marginTop: 6,
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  ctaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cta: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
  },
});
