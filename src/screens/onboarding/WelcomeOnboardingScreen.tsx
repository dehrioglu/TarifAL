import { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { BrandLogo } from '../../components/BrandLogo';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const featureCards = [
  {
    icon: 'basket-outline' as const,
    title: 'Malzemeden tarif',
    description: 'Dolabında ne varsa yaz, TarifAL sana uygun yemekleri önersin.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'AI öneri',
    description: 'Zamana, bütçene ve damak zevkine göre akıllı tarifler keşfet.',
  },
  {
    icon: 'cart-outline' as const,
    title: 'Sepete dönüştür',
    description: 'Eksik malzemeleri alışveriş listesine ekleyerek yemeği plana dönüştür.',
  },
];

export function WelcomeOnboardingScreen() {
  const completeWelcomeOnboarding = useAppStore((store) => store.completeWelcomeOnboarding);
  const logoAnim = useRef(new Animated.Value(0)).current;
  const copyAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useMemo(() => featureCards.map(() => new Animated.Value(0)), []);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(copyAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.stagger(
        90,
        cardAnims.map((animation) =>
          Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [cardAnims, copyAnim, logoAnim, pulseAnim]);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });
  const copyTranslate = copyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const buttonScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.025],
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.backgroundShapeTop} />
      <View style={styles.backgroundShapeBottom} />
      <View style={styles.sparkleOne}>
        <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.sparkleTwo}>
        <Ionicons name="restaurant-outline" size={18} color={theme.colors.primary} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Animated.View style={[styles.logoWrap, { opacity: logoAnim, transform: [{ scale: logoScale }] }]}>
            <BrandLogo size={132} />
          </Animated.View>

          <Animated.View
            style={[
              styles.copy,
              {
                opacity: copyAnim,
                transform: [{ translateY: copyTranslate }],
              },
            ]}
          >
            <Text style={styles.title}>TarifAL mutfağını tanımaya hazır ✨</Text>
            <Text style={styles.description}>
              Evindeki malzemeleri akıllı tariflere, eksik ürünleri alışveriş listesine dönüştürelim.
            </Text>
            <Text style={styles.highlight}>Sana TarifAL’i 30 saniyede tanıtalım.</Text>
          </Animated.View>

          <View style={styles.features}>
            {featureCards.map((feature, index) => {
              const translateY = cardAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              });

              return (
                <Animated.View
                  key={feature.title}
                  style={[
                    styles.featureCard,
                    {
                      opacity: cardAnims[index],
                      transform: [{ translateY }],
                    },
                  ]}
                >
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.featureCopy}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View style={[styles.primaryButtonWrap, { transform: [{ scale: buttonScale }] }]}>
            <AppButton
              title="Keşfe Başlayalım"
              icon="sparkles"
              onPress={() => void completeWelcomeOnboarding(true)}
            />
          </Animated.View>
          <AppButton
            title="Şimdilik Atla"
            variant="ghost"
            onPress={() => void completeWelcomeOnboarding(false)}
            style={styles.skipButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.screen.padding,
    paddingBottom: 34,
  },
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 22,
  },
  backgroundShapeTop: {
    position: 'absolute',
    right: -70,
    top: -46,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: theme.colors.primarySoft,
  },
  backgroundShapeBottom: {
    position: 'absolute',
    left: -92,
    bottom: -76,
    width: 238,
    height: 238,
    borderRadius: 119,
    backgroundColor: '#F7F9FC',
  },
  sparkleOne: {
    position: 'absolute',
    right: 42,
    top: 118,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  sparkleTwo: {
    position: 'absolute',
    left: 28,
    bottom: 148,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  copy: {
    marginTop: 12,
    alignItems: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 29,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 35,
  },
  description: {
    marginTop: 12,
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    textAlign: 'center',
  },
  highlight: {
    marginTop: 16,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  features: {
    marginTop: 24,
    gap: 12,
  },
  featureCard: {
    minHeight: 86,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  featureDescription: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  primaryButtonWrap: {
    marginTop: 24,
  },
  skipButton: {
    marginTop: 8,
  },
});
