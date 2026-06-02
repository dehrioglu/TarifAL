import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

type SmartHeroCardProps = {
  imageUrl: string;
  recipeCount: number;
  matchPercent: number;
  availableRecipeCount: number;
  onOpenToday: () => void;
  onOpenPantry: () => void;
};

export function SmartHeroCard({
  imageUrl,
  recipeCount,
  matchPercent,
  availableRecipeCount,
  onOpenToday,
  onOpenPantry,
}: SmartHeroCardProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 560,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sparkle, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    sparkleLoop.start();

    return () => sparkleLoop.stop();
  }, [entrance, sparkle]);

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
        ],
      }}
    >
      <ImageBackground source={{ uri: imageUrl }} style={styles.card} imageStyle={styles.image}>
        <View style={styles.overlay} />
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle.interpolate({
                inputRange: [0, 1],
                outputRange: [0.55, 1],
              }),
              transform: [
                {
                  scale: sparkle.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1.08],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="sparkles" size={15} color="#FFFFFF" />
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={13} color="#FFFFFF" />
            <Text style={styles.badgeText}>TarifAL AI aktif</Text>
          </View>
          <Text style={styles.title}>Bugün sana uygun {recipeCount} tarif buldum</Text>
          <Text style={styles.match}>Dolabındaki ürünlerle %{matchPercent} uyumlu</Text>
          <Text style={styles.description}>
            {availableRecipeCount} tarif tamamen evdeki malzemelerle yapılabilir.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onOpenToday}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel="Bugün Ne Pişirsem"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryText}>Bugün Ne Pişirsem?</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onOpenPantry}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel="Dolabımı Aç"
              style={styles.secondaryButton}
            >
              <Ionicons name="home-outline" size={16} color="#FFFFFF" />
              <Text style={styles.secondaryText}>Dolabımı Aç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 342,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...theme.shadow,
    shadowOpacity: 0.16,
  },
  image: {
    borderRadius: 28,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.54)',
  },
  sparkle: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,90,0,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,90,0,0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    maxWidth: 520,
    marginTop: 14,
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '900',
  },
  match: {
    marginTop: 8,
    color: '#FFD7C2',
    fontSize: 14,
    fontWeight: '900',
  },
  description: {
    marginTop: 5,
    color: '#F2F4F7',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  actions: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.54)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
