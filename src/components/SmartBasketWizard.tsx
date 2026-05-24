import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { InvestorConversionStrip } from './InvestorConversionStrip';
import { SmartBasketAnalysisStep } from './SmartBasketAnalysisStep';
import { SmartBasketIngredientStep } from './SmartBasketIngredientStep';
import { SmartBasketMarketPreview } from './SmartBasketMarketPreview';
import { SmartBasketMissingItems } from './SmartBasketMissingItems';
import { SmartBasketPlanCard } from './SmartBasketPlanCard';
import { SmartBasketPreferenceStep } from './SmartBasketPreferenceStep';
import { SmartBasketStepHeader } from './SmartBasketStepHeader';
import { SmartBasketSuccess } from './SmartBasketSuccess';
import { BrandLogo } from './BrandLogo';
import { smartBasketQuickIngredients } from '../data/demoSmartBasket';
import { theme } from '../constants/theme';
import { useFeedback } from '../feedback/FeedbackProvider';
import { useAppStore } from '../store/useAppStore';
import { parsePantryText } from '../utils/recipeMatching';

type SmartBasketWizardProps = {
  initialRecipeId?: string;
  initialIngredients?: string[];
  startFrom?: 'intro' | 'servings';
  onClose: () => void;
  onGoCart: () => void;
  onOpenRecipe: (recipeId: string) => void;
};

type WizardStep =
  | 'intro'
  | 'ingredients'
  | 'servings'
  | 'budget'
  | 'analysis'
  | 'plans'
  | 'missing'
  | 'market'
  | 'success';

const stepMeta: Record<Exclude<WizardStep, 'success'>, { step: number; eyebrow: string; title: string; description: string }> = {
  intro: {
    step: 1,
    eyebrow: 'TarifAL Akıllı Sepet',
    title: 'Malzemeden sepete akıllı plan',
    description: 'Evindeki malzemeleri, kişi sayını ve bütçeni gir; TarifAL eksikleri market sepetine dönüştürsün.',
  },
  ingredients: {
    step: 2,
    eyebrow: '1. Malzemeler',
    title: 'Dolabını TarifAL’e anlat',
    description: 'Seçtiğin malzemeler tarif uyumu, eksik ürün ve sepet hesabının temelini oluşturur.',
  },
  servings: {
    step: 3,
    eyebrow: '2. Kişi sayısı',
    title: 'Plan kaç kişilik olacak?',
    description: 'Porsiyon bilgisi fiyat ve eksik ürün miktarını daha gerçekçi hale getirir.',
  },
  budget: {
    step: 4,
    eyebrow: '3. Bütçe',
    title: 'Bütçene uygun plan seçelim',
    description: 'Türkiye pazarı için bütçe, TarifAL’in en güçlü kişiselleştirme sinyallerinden biri.',
  },
  analysis: {
    step: 5,
    eyebrow: '4. AI analiz',
    title: 'TarifAL mutfağını analiz ediyor',
    description: 'Tarif uyumu, bütçe ve market listesi tek akışta hesaplanıyor.',
  },
  plans: {
    step: 6,
    eyebrow: '5. Plan önerileri',
    title: 'Senin için 3 akıllı plan',
    description: 'Her öneride malzeme uyumu, tahmini maliyet ve eksik ürün sayısı görünür.',
  },
  missing: {
    step: 7,
    eyebrow: '6. Eksikler',
    title: 'Eksikleri market listesine çevirelim',
    description: 'Tarif için gereken eksik ürünler birleşik alışveriş listesi olarak hazırlanır.',
  },
  market: {
    step: 8,
    eyebrow: '7. Demo market',
    title: 'Tarif artık sepete dönüşüyor',
    description: 'Bu ekran yatırımcıya TarifAL’in ticari modelini net gösterir.',
  },
};

const totalSteps = 8;

export function SmartBasketWizard({
  initialRecipeId,
  initialIngredients: initialIngredientsProp,
  startFrom = 'intro',
  onClose,
  onGoCart,
  onOpenRecipe,
}: SmartBasketWizardProps) {
  const pantryText = useAppStore((store) => store.pantryText);
  const smartBasket = useAppStore((store) => store.smartBasket);
  const createSmartBasketPlan = useAppStore((store) => store.createSmartBasketPlan);
  const selectSmartBasketPlan = useAppStore((store) => store.selectSmartBasketPlan);
  const addSmartBasketItemsToCart = useAppStore((store) => store.addSmartBasketItemsToCart);
  const resetSmartBasketFlow = useAppStore((store) => store.resetSmartBasketFlow);
  const completeSmartBasketDemo = useAppStore((store) => store.completeSmartBasketDemo);
  const { showToast } = useFeedback();
  const initialIngredients = useMemo(() => {
    if (initialIngredientsProp && initialIngredientsProp.length > 0) {
      return initialIngredientsProp;
    }

    const pantryItems = parsePantryText(pantryText);
    return pantryItems.length > 0 ? pantryItems : smartBasketQuickIngredients.slice(0, 4);
  }, [initialIngredientsProp, pantryText]);
  const [step, setStep] = useState<WizardStep>(startFrom);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [servings, setServings] = useState(2);
  const [budgetModeId, setBudgetModeId] = useState('under-250');

  const selectedPlan = useMemo(
    () =>
      smartBasket.plans.find((plan) => plan.id === smartBasket.selectedPlanId) ??
      smartBasket.plans[0],
    [smartBasket.plans, smartBasket.selectedPlanId],
  );
  const currentMeta = step === 'success' ? null : stepMeta[step];

  const goBack = () => {
    const order: WizardStep[] = ['intro', 'ingredients', 'servings', 'budget', 'analysis', 'plans', 'missing', 'market'];
    const index = order.indexOf(step);

    if (index <= 0) {
      onClose();
      return;
    }

    setStep(order[index - 1]);
  };

  const startAnalysis = () => {
    createSmartBasketPlan({
      ingredients,
      servings,
      budgetModeId,
      recipeId: initialRecipeId,
    });
    setStep('analysis');
  };

  const handleAnalysisComplete = useCallback(() => {
    setStep('plans');
  }, []);

  const handleSelectPlan = (planId: string) => {
    selectSmartBasketPlan(planId);
    setStep('missing');
  };

  const handleAddToCart = () => {
    addSmartBasketItemsToCart(selectedPlan?.id);
    completeSmartBasketDemo();
    showToast('Akıllı sepet hazırlandı. Eksik ürünler sepete aktarıldı.');
    setStep('success');
  };

  const restart = () => {
    resetSmartBasketFlow();
    setIngredients(initialIngredients);
    setServings(2);
    setBudgetModeId('under-250');
    setStep('intro');
  };

  const renderIntro = () => (
    <View style={styles.introCard}>
      <View style={styles.brandWrap}>
        <BrandLogo size={94} />
      </View>
      <View style={styles.flowIconRow}>
        <View style={styles.flowIcon}>
          <Ionicons name="basket-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.flowLine} />
        <View style={styles.flowIcon}>
          <Ionicons name="restaurant-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.flowLine} />
        <View style={styles.flowIcon}>
          <Ionicons name="cart-outline" size={22} color={theme.colors.primary} />
        </View>
      </View>
      <Text style={styles.introTitle}>Kullanıcı niyetini market sepetine dönüştür</Text>
      <Text style={styles.introText}>
        TarifAL evdeki malzemeyi okur, uygun tarifleri sıralar, eksikleri bulur ve tek tıkla Demo Market sepeti oluşturur.
      </Text>
      <InvestorConversionStrip compact />
      <TouchableOpacity onPress={() => setStep('ingredients')} activeOpacity={0.88} style={styles.primaryButton}>
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.primaryText}>Akıllı Sepet Oluştur</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlans = () => (
    <View style={styles.planList}>
      {smartBasket.plans.map((plan) => (
        <SmartBasketPlanCard
          key={plan.id}
          plan={plan}
          selected={plan.id === selectedPlan?.id}
          onSelect={() => handleSelectPlan(plan.id)}
          onOpenRecipe={() => onOpenRecipe(plan.recipeId)}
        />
      ))}
    </View>
  );

  const renderBody = () => {
    if (step === 'intro') {
      return renderIntro();
    }

    if (step === 'ingredients') {
      return (
        <SmartBasketIngredientStep
          selectedIngredients={ingredients}
          onChange={setIngredients}
          onNext={() => setStep('servings')}
        />
      );
    }

    if (step === 'servings') {
      return (
        <SmartBasketPreferenceStep
          mode="servings"
          servings={servings}
          budgetModeId={budgetModeId}
          onChangeServings={setServings}
          onChangeBudget={setBudgetModeId}
          onNext={() => setStep('budget')}
        />
      );
    }

    if (step === 'budget') {
      return (
        <SmartBasketPreferenceStep
          mode="budget"
          servings={servings}
          budgetModeId={budgetModeId}
          onChangeServings={setServings}
          onChangeBudget={setBudgetModeId}
          onNext={startAnalysis}
        />
      );
    }

    if (step === 'analysis') {
      return <SmartBasketAnalysisStep onComplete={handleAnalysisComplete} />;
    }

    if (step === 'plans') {
      return renderPlans();
    }

    if (step === 'missing' && selectedPlan) {
      return <SmartBasketMissingItems plan={selectedPlan} onNext={() => setStep('market')} />;
    }

    if (step === 'market' && selectedPlan) {
      return <SmartBasketMarketPreview plan={selectedPlan} onAddToCart={handleAddToCart} />;
    }

    return <SmartBasketSuccess onGoCart={onGoCart} onRestart={restart} />;
  };

  return (
    <View style={styles.wrap}>
      {currentMeta ? (
        <SmartBasketStepHeader
          eyebrow={currentMeta.eyebrow}
          title={currentMeta.title}
          description={currentMeta.description}
          step={currentMeta.step}
          totalSteps={totalSteps}
          onBack={currentMeta.step > 1 ? goBack : undefined}
          onClose={onClose}
        />
      ) : null}
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 16,
  },
  introCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 18,
    gap: 14,
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  brandWrap: {
    alignItems: 'center',
  },
  flowIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  flowIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLine: {
    width: 34,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFD8C4',
  },
  introTitle: {
    color: theme.colors.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    textAlign: 'center',
  },
  introText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  planList: {
    gap: 12,
  },
});
