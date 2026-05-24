import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { BrandLogo } from './BrandLogo';

type PreloaderProps = {
  onDone: () => void;
};

type IngredientParticleProps = {
  emoji: string;
  progress: Animated.Value;
  startX: number;
  startY: number;
  delay: number;
};

const loadingMessages = [
  'Malzemeler analiz ediliyor...',
  'Tarif oluşturuluyor...',
  'Market listesi hazırlanıyor...',
];

const PRELOADER_DURATION_MS = 2300;
const PROGRESS_DURATION_MS = 2050;
const INGREDIENT_DURATION_MS = 1450;

function IngredientParticle({ emoji, progress, startX, startY, delay }: IngredientParticleProps) {
  const end = Math.min(delay + 0.5, 0.96);
  const opacity = progress.interpolate({
    inputRange: [0, delay, Math.min(delay + 0.12, 0.98), 1],
    outputRange: [0, 0, 1, 0.25],
    extrapolate: 'clamp',
  });
  const translateX = progress.interpolate({
    inputRange: [0, delay, end, 1],
    outputRange: [startX, startX, 0, 0],
    extrapolate: 'clamp',
  });
  const translateY = progress.interpolate({
    inputRange: [0, delay, end, 1],
    outputRange: [startY, startY, 0, 0],
    extrapolate: 'clamp',
  });
  const scale = progress.interpolate({
    inputRange: [0, delay, end, 1],
    outputRange: [0.74, 0.74, 1, 0.52],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.ingredient,
        {
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      <Text style={styles.ingredientEmoji}>{emoji}</Text>
    </Animated.View>
  );
}

export function Preloader({ onDone }: PreloaderProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const stageScale = useRef(new Animated.Value(0.94)).current;
  const ingredientProgress = useRef(new Animated.Value(0)).current;
  const messageProgress = useRef(new Animated.Value(0)).current;
  const aiPulse = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.9)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandScale = useRef(new Animated.Value(0.96)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulse, {
          toValue: 1,
          duration: 620,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(aiPulse, {
          toValue: 0,
          duration: 620,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(stageScale, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(ingredientProgress, {
        toValue: 1,
        duration: INGREDIENT_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(messageProgress, {
        toValue: 1,
        duration: PROGRESS_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: PROGRESS_DURATION_MS,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(820),
        Animated.parallel([
          Animated.timing(resultOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.spring(resultScale, {
            toValue: 1,
            friction: 7,
            tension: 80,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(1320),
        Animated.parallel([
          Animated.timing(brandOpacity, {
            toValue: 1,
            duration: 360,
            useNativeDriver: true,
          }),
          Animated.spring(brandScale, {
            toValue: 1,
            friction: 8,
            tension: 70,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(PRELOADER_DURATION_MS - 220),
        Animated.timing(rootOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(onDone, PRELOADER_DURATION_MS);

    return () => {
      pulseLoop.stop();
      clearTimeout(timer);
    };
  }, [
    aiPulse,
    brandOpacity,
    brandScale,
    ingredientProgress,
    messageProgress,
    onDone,
    opacity,
    progress,
    resultOpacity,
    resultScale,
    rootOpacity,
    stageScale,
  ]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });
  const sparkleScale = aiPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.16],
  });
  const sparkleOpacity = aiPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.48, 1],
  });
  const firstMessageOpacity = messageProgress.interpolate({
    inputRange: [0, 0.3, 0.42],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });
  const secondMessageOpacity = messageProgress.interpolate({
    inputRange: [0.26, 0.38, 0.62, 0.74],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });
  const thirdMessageOpacity = messageProgress.interpolate({
    inputRange: [0.6, 0.74, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.root, { opacity: rootOpacity }]}>
      <View style={styles.backgroundGlowOne} />
      <View style={styles.backgroundGlowTwo} />

      <Animated.View style={[styles.content, { opacity, transform: [{ scale: stageScale }] }]}>
        <View style={styles.stage}>
          <View style={styles.aiOrbit} />
          <View style={styles.recipePanel}>
            <View style={styles.panelTop}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <View style={styles.aiBadge}>
                <Animated.View style={{ opacity: sparkleOpacity, transform: [{ scale: sparkleScale }] }}>
                  <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
                </Animated.View>
                <Text style={styles.aiText}>AI</Text>
              </View>
            </View>
            <View style={styles.recipeLineWide} />
            <View style={styles.recipeLine} />
            <View style={styles.recipeLineShort} />
          </View>

          <View style={styles.pot}>
            <View style={styles.potSteamOne} />
            <View style={styles.potSteamTwo} />
            <Ionicons name="restaurant-outline" size={34} color="#FFFFFF" />
          </View>

          <IngredientParticle emoji="🍅" progress={ingredientProgress} startX={-106} startY={-78} delay={0.02} />
          <IngredientParticle emoji="🧅" progress={ingredientProgress} startX={102} startY={-66} delay={0.08} />
          <IngredientParticle emoji="🌶️" progress={ingredientProgress} startX={-116} startY={36} delay={0.14} />
          <IngredientParticle emoji="🥚" progress={ingredientProgress} startX={112} startY={44} delay={0.2} />
          <IngredientParticle emoji="🧀" progress={ingredientProgress} startX={-58} startY={94} delay={0.26} />
          <IngredientParticle emoji="🍝" progress={ingredientProgress} startX={64} startY={94} delay={0.32} />

          <Animated.View
            style={[
              styles.resultCluster,
              { opacity: resultOpacity, transform: [{ scale: resultScale }] },
            ]}
          >
            <View style={styles.resultIcon}>
              <Ionicons name="book-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={[styles.resultIcon, styles.resultIconPrimary]}>
              <Ionicons name="fast-food-outline" size={19} color="#FFFFFF" />
            </View>
            <View style={styles.resultIcon}>
              <Ionicons name="basket-outline" size={18} color={theme.colors.primary} />
            </View>
          </Animated.View>
        </View>

        <View style={styles.messageWrap}>
          <Animated.Text style={[styles.loadingMessage, { opacity: firstMessageOpacity }]}>
            {loadingMessages[0]}
          </Animated.Text>
          <Animated.Text style={[styles.loadingMessage, styles.messageAbsolute, { opacity: secondMessageOpacity }]}>
            {loadingMessages[1]}
          </Animated.Text>
          <Animated.Text style={[styles.loadingMessage, styles.messageAbsolute, { opacity: thirdMessageOpacity }]}>
            {loadingMessages[2]}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.brandBlock, { opacity: brandOpacity, transform: [{ scale: brandScale }] }]}>
          <BrandLogo size={190} />
          <Text style={styles.subtitle}>Mutfağının şefi sensin</Text>
        </Animated.View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.screen.padding,
    overflow: 'hidden',
  },
  backgroundGlowOne: {
    position: 'absolute',
    top: -86,
    right: -74,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255, 90, 0, 0.11)',
  },
  backgroundGlowTwo: {
    position: 'absolute',
    left: -92,
    bottom: -112,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 214, 190, 0.36)',
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  stage: {
    width: 284,
    height: 220,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...theme.shadow,
    shadowOpacity: 0.07,
  },
  aiOrbit: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 0, 0.18)',
    borderStyle: 'dashed',
  },
  recipePanel: {
    position: 'absolute',
    top: 24,
    left: 28,
    width: 126,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  panelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiBadge: {
    minHeight: 26,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  recipeLineWide: {
    width: '88%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#FFE0CF',
    marginBottom: 7,
  },
  recipeLine: {
    width: '68%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#EEF0F5',
    marginBottom: 7,
  },
  recipeLineShort: {
    width: '46%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#EEF0F5',
  },
  pot: {
    position: 'absolute',
    bottom: 42,
    width: 88,
    height: 64,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.orangeShadow,
    shadowOpacity: 0.14,
  },
  potSteamOne: {
    position: 'absolute',
    top: -24,
    left: 26,
    width: 7,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#FFD8C4',
  },
  potSteamTwo: {
    position: 'absolute',
    top: -30,
    right: 28,
    width: 7,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFE8DB',
  },
  ingredient: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE0CF',
  },
  ingredientEmoji: {
    fontSize: 21,
  },
  resultCluster: {
    position: 'absolute',
    right: 26,
    bottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  messageWrap: {
    marginTop: 18,
    minHeight: 22,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMessage: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  messageAbsolute: {
    position: 'absolute',
  },
  brandBlock: {
    marginTop: 10,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  progressTrack: {
    width: '70%',
    height: 7,
    borderRadius: 4,
    marginTop: 18,
    backgroundColor: '#FFE0CF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
