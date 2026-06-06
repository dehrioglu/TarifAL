import { ComponentProps, useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type QuickKitchenAction = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  tone?: 'orange' | 'green' | 'navy';
  onPress: () => void;
};

type QuickActionCarouselProps = {
  actions: QuickKitchenAction[];
};

function QuickActionCard({ action, index }: { action: QuickKitchenAction; index: number }) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 240,
      delay: index * 30,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance, index]);

  const scaleTo = (toValue: number) => {
    Animated.timing(pressScale, {
      toValue,
      duration: 110,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateX: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [6, 0],
            }),
          },
          { scale: pressScale },
        ],
      }}
    >
      <TouchableOpacity
        onPress={action.onPress}
        onPressIn={() => scaleTo(0.985)}
        onPressOut={() => scaleTo(1)}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={action.title}
        style={styles.card}
      >
        <View
          style={[
            styles.icon,
            action.tone === 'green' && styles.greenIcon,
            action.tone === 'navy' && styles.navyIcon,
          ]}
        >
          <Ionicons
            name={action.icon}
            size={19}
            color={
              action.tone === 'green'
                ? theme.colors.success
                : action.tone === 'navy'
                  ? theme.colors.text
                  : theme.colors.primary
            }
          />
        </View>
        <Text style={styles.title}>{action.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{action.description}</Text>
        <View style={styles.arrow}>
          <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function QuickActionCarousel({ actions }: QuickActionCarouselProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {actions.map((action, index) => (
        <QuickActionCard key={action.id} action={action} index={index} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 2,
    paddingRight: 4,
  },
  card: {
    width: 174,
    minHeight: 150,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    ...theme.shadow,
    shadowOpacity: 0.035,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenIcon: {
    backgroundColor: '#ECFDF3',
  },
  navyIcon: {
    backgroundColor: '#EEF1F7',
  },
  title: {
    marginTop: 11,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  description: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  arrow: {
    position: 'absolute',
    right: 12,
    bottom: 11,
  },
});
