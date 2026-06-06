import { ComponentProps, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type QuickKitchenAction = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  tone?: 'orange' | 'green' | 'navy' | 'amber' | 'blue';
  onPress: () => void;
};

type QuickActionGridProps = {
  actions: QuickKitchenAction[];
};

type ServiceVisual = {
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  icon: IconName;
  accentIcon: IconName;
};

const serviceVisuals: Record<string, ServiceVisual> = {
  home: {
    backgroundColor: '#FFF1E8',
    foregroundColor: theme.colors.primary,
    accentColor: '#FFE0CF',
    icon: 'home-outline',
    accentIcon: 'restaurant-outline',
  },
  basket: {
    backgroundColor: '#FFF4E5',
    foregroundColor: theme.colors.primary,
    accentColor: '#FFD9A3',
    icon: 'basket-outline',
    accentIcon: 'cube-outline',
  },
  meal: {
    backgroundColor: '#EEF2F7',
    foregroundColor: theme.colors.text,
    accentColor: '#D9E2EF',
    icon: 'restaurant-outline',
    accentIcon: 'bag-handle-outline',
  },
  plan: {
    backgroundColor: '#F0F7FF',
    foregroundColor: '#2563EB',
    accentColor: '#D7E9FF',
    icon: 'calendar-outline',
    accentIcon: 'fast-food-outline',
  },
  fit: {
    backgroundColor: '#ECFDF3',
    foregroundColor: theme.colors.success,
    accentColor: '#CFF7DF',
    icon: 'leaf-outline',
    accentIcon: 'fitness-outline',
  },
  economic: {
    backgroundColor: '#FFF7D6',
    foregroundColor: '#B7791F',
    accentColor: '#FFE8A3',
    icon: 'wallet-outline',
    accentIcon: 'pricetag-outline',
  },
};

const fallbackVisual: ServiceVisual = {
  backgroundColor: theme.colors.primarySoft,
  foregroundColor: theme.colors.primary,
  accentColor: '#FFE0CF',
  icon: 'apps-outline',
  accentIcon: 'arrow-forward',
};

function ServiceIcon({ action }: { action: QuickKitchenAction }) {
  const visual = serviceVisuals[action.id] ?? fallbackVisual;

  return (
    <View style={[styles.iconBox, { backgroundColor: visual.backgroundColor }]}>
      <Ionicons name={visual.icon} size={24} color={visual.foregroundColor} />
      <View style={[styles.iconBadge, { backgroundColor: visual.accentColor }]}>
        <Ionicons name={visual.accentIcon} size={12} color={visual.foregroundColor} />
      </View>
    </View>
  );
}

function QuickActionCard({
  action,
  index,
  columns,
}: {
  action: QuickKitchenAction;
  index: number;
  columns: number;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 220,
      delay: index * 24,
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
      style={[
        styles.cardWrap,
        columns === 3 ? styles.webCardWrap : styles.mobileCardWrap,
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [6, 0],
              }),
            },
            { scale: pressScale },
          ],
        },
      ]}
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
        <View style={styles.cardTop}>
          <ServiceIcon action={action} />
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {action.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {action.description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function QuickActionGrid({ actions }: QuickActionGridProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 760 ? 3 : 2;

  return (
    <View style={styles.grid}>
      {actions.map((action, index) => (
        <QuickActionCard key={action.id} action={action} index={index} columns={columns} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardWrap: {
    flexGrow: 1,
  },
  mobileCardWrap: {
    flexBasis: '47%',
  },
  webCardWrap: {
    flexBasis: '31%',
  },
  card: {
    minHeight: 142,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    justifyContent: 'space-between',
    ...theme.shadow,
    shadowOpacity: 0.035,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 14,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  description: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
