import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { InvestorConversionStrip } from '../../components/InvestorConversionStrip';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useFeedback } from '../../feedback/FeedbackProvider';
import {
  demoDetectedIngredients,
  demoVisionAnalysisSteps,
  demoVisionMetrics,
} from '../../data/demoVision';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PantryVision'>;

type VisionPhase = 'capture' | 'analysis' | 'review';

export function PantryVisionScreen({ navigation }: Props) {
  const setPantryText = useAppStore((store) => store.setPantryText);
  const [phase, setPhase] = useState<VisionPhase>('capture');
  const [imageUri, setImageUri] = useState<string>();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(
    demoDetectedIngredients.reduce<Record<string, boolean>>((acc, ingredient) => {
      acc[ingredient.id] = true;
      return acc;
    }, {}),
  );
  const [customIngredient, setCustomIngredient] = useState('');
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const { showToast } = useFeedback();

  useEffect(() => {
    if (phase !== 'analysis') {
      return;
    }

    setActiveStep(0);
    const timers = demoVisionAnalysisSteps.map((_, index) =>
      setTimeout(() => setActiveStep(index), index * 540),
    );
    const finishTimer = setTimeout(() => setPhase('review'), demoVisionAnalysisSteps.length * 540 + 520);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, [phase]);

  const selectedIngredients = useMemo(() => {
    const detected = demoDetectedIngredients
      .filter((ingredient) => selectedMap[ingredient.id])
      .map((ingredient) => ingredient.name);

    return [...new Set([...detected, ...customIngredients])];
  }, [customIngredients, selectedMap]);

  const startAnalysis = () => {
    setPhase('analysis');
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast('Dolabını taramak için galeri erişim izni gerekiyor.', 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      startAnalysis();
    }
  };

  const toggleIngredient = (id: string) => {
    setSelectedMap((current) => ({ ...current, [id]: !current[id] }));
  };

  const addCustomIngredient = () => {
    const value = customIngredient.trim();

    if (!value) {
      showToast('Eklemek için malzeme adı yaz.', 'warning');
      return;
    }

    setCustomIngredients((current) => [...new Set([...current, value])]);
    setCustomIngredient('');
    showToast(`${value} malzeme listesine eklendi.`);
  };

  const removeCustomIngredient = (ingredient: string) => {
    setCustomIngredients((current) => current.filter((item) => item !== ingredient));
  };

  const continueToSmartBasket = () => {
    if (selectedIngredients.length === 0) {
      showToast('Akıllı Sepet oluşturmak için en az bir malzeme seçmelisin.', 'warning');
      return;
    }

    setPantryText(selectedIngredients.join(', '));
    navigation.navigate('SmartBasket', {
      ingredients: selectedIngredients,
      startFrom: 'servings',
    });
  };

  const renderCapture = () => (
    <View style={styles.stack}>
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons name="camera-outline" size={26} color={theme.colors.primary} />
          </View>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
            <Text style={styles.aiBadgeText}>TarifAL Vision</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>Fotoğrafla Dolabımı Tara</Text>
        <Text style={styles.heroText}>
          Buzdolabı veya tezgah fotoğrafını yükle; TarifAL malzemeleri tanısın ve Akıllı Sepet akışına taşısın.
        </Text>
        <View style={styles.flowRow}>
          <Text style={styles.flowText}>Fotoğraf</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
          <Text style={styles.flowText}>Malzeme</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
          <Text style={styles.flowText}>Sepet</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={pickImage}
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel="Dolap fotoğrafı seç"
        style={styles.uploadBox}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.uploadContent}>
            <Ionicons name="image-outline" size={42} color={theme.colors.primary} />
            <Text style={styles.uploadTitle}>Dolap veya tezgah fotoğrafı seç</Text>
            <Text style={styles.uploadText}>MVP demosunda malzemeler simülasyon olarak tanınır.</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.86} style={styles.primaryButton}>
          <Ionicons name="cloud-upload-outline" size={17} color="#FFFFFF" />
          <Text style={styles.primaryText}>Fotoğraf Seç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            showToast('Demo fotoğraf analizi başlatıldı.', 'info');
            startAnalysis();
          }}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Demo fotoğrafla tara"
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>Demo Fotoğrafla Tara</Text>
        </TouchableOpacity>
      </View>

      <InvestorConversionStrip compact />
    </View>
  );

  const renderAnalysis = () => (
    <View style={styles.analysisCard}>
      <View style={styles.scanIcon}>
        <Ionicons name="scan-outline" size={34} color={theme.colors.primary} />
      </View>
      <Text style={styles.analysisTitle}>TarifAL Vision analiz ediyor</Text>
      <Text style={styles.analysisText}>Fotoğrafındaki malzemeler Akıllı Sepet için hazırlanıyor.</Text>
      <View style={styles.analysisSteps}>
        {demoVisionAnalysisSteps.map((step, index) => {
          const active = index === activeStep;
          const complete = index < activeStep;

          return (
            <View key={step} style={[styles.analysisRow, active && styles.activeAnalysisRow]}>
              <View style={[styles.analysisDot, (active || complete) && styles.activeAnalysisDot]}>
                <Ionicons
                  name={complete ? 'checkmark' : active ? 'sparkles' : 'ellipse-outline'}
                  size={14}
                  color={active || complete ? '#FFFFFF' : theme.colors.subtle}
                />
              </View>
              <Text style={[styles.analysisStepText, active && styles.activeAnalysisText]}>{step}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderReview = () => (
    <View style={styles.stack}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewTitle}>Tanınan malzemeleri onayla</Text>
          <Text style={styles.reviewText}>Yanlış gördüklerini kaldırabilir, eksik malzemeleri ekleyebilirsin.</Text>
        </View>
        <View style={styles.reviewIcon}>
          <Ionicons name="checkmark-done-outline" size={21} color={theme.colors.primary} />
        </View>
      </View>

      <View style={styles.metricsRow}>
        {demoVisionMetrics.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.detectedList}>
        {demoDetectedIngredients.map((ingredient) => {
          const selected = selectedMap[ingredient.id];

          return (
            <TouchableOpacity
              key={ingredient.id}
              onPress={() => toggleIngredient(ingredient.id)}
              activeOpacity={0.86}
              style={[styles.detectedRow, selected && styles.selectedDetectedRow]}
            >
              <Ionicons
                name={selected ? 'checkbox' : 'square-outline'}
                size={22}
                color={selected ? theme.colors.primary : theme.colors.subtle}
              />
              <View style={styles.detectedCopy}>
                <Text style={styles.detectedName}>{ingredient.name}</Text>
                <Text style={styles.detectedHint}>{ingredient.hint}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>%{ingredient.confidence}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={customIngredient}
          onChangeText={setCustomIngredient}
          onSubmitEditing={addCustomIngredient}
          placeholder="Eksik malzeme ekle"
          placeholderTextColor={theme.colors.subtle}
          style={styles.input}
        />
        <TouchableOpacity onPress={addCustomIngredient} activeOpacity={0.86} style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {customIngredients.length > 0 ? (
        <View style={styles.customWrap}>
          {customIngredients.map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              onPress={() => removeCustomIngredient(ingredient)}
              activeOpacity={0.85}
              style={styles.customChip}
            >
              <Text style={styles.customText}>{ingredient}</Text>
              <Ionicons name="close" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <TouchableOpacity onPress={continueToSmartBasket} activeOpacity={0.88} style={styles.primaryButtonWide}>
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.primaryText}>Akıllı Sepet'e Aktar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.86} style={styles.closeButton}>
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Dolabımı Tara</Text>
        <View style={styles.closeButtonGhost} />
      </View>

      {phase === 'capture' ? renderCapture() : null}
      {phase === 'analysis' ? renderAnalysis() : null}
      {phase === 'review' ? renderReview() : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingTop: 12,
  },
  topBar: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonGhost: {
    width: 42,
    height: 42,
  },
  topTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  stack: {
    gap: 14,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 18,
    gap: 14,
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  heroText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  flowRow: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  flowText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  uploadBox: {
    minHeight: 220,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#FFE0CF',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  uploadContent: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 240,
  },
  uploadTitle: {
    marginTop: 12,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  uploadText: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  analysisCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 18,
    alignItems: 'center',
    gap: 14,
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  scanIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTitle: {
    color: theme.colors.text,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  analysisText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  analysisSteps: {
    width: '100%',
    gap: 10,
  },
  analysisRow: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeAnalysisRow: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: '#FFD8C4',
  },
  analysisDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeAnalysisDot: {
    backgroundColor: theme.colors.primary,
  },
  analysisStepText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  activeAnalysisText: {
    color: theme.colors.text,
  },
  reviewHeader: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  reviewTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  reviewText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  reviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minHeight: 72,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 10,
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.colors.primary,
    fontSize: 19,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  detectedList: {
    gap: 9,
  },
  detectedRow: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedDetectedRow: {
    borderColor: '#FFD8C4',
    backgroundColor: theme.colors.primarySoft,
  },
  detectedCopy: {
    flex: 1,
  },
  detectedName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  detectedHint: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  confidenceBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  confidenceText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    color: theme.colors.text,
    fontWeight: '800',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customChip: {
    minHeight: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  primaryButtonWide: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
});
