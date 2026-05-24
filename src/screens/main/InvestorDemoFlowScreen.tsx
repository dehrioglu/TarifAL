import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { BrandLogo } from '../../components/BrandLogo';
import { CookingMode } from '../../components/CookingMode';
import { InvestorConversionStrip } from '../../components/InvestorConversionStrip';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { demoSmartBasketMarket } from '../../data/demoSmartBasket';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { Ingredient, SmartBasketPlan } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'InvestorDemo'>;

const demoIngredients = ['makarna', 'yoğurt', 'domates'];
const totalSteps = 7;

const trackingSteps = [
  { id: 'received', title: 'Sipariş alındı', text: 'Eksik ürünler demo market sepetinde toplandı.', icon: 'checkmark-circle' },
  { id: 'preparing', title: 'Market hazırlanıyor', text: 'Ürünler tarif bazlı kontrol ediliyor.', icon: 'storefront-outline' },
  { id: 'courier', title: 'Kurye yolda', text: 'Teslimat 30-45 dk olarak simüle edildi.', icon: 'bicycle-outline' },
  { id: 'delivered', title: 'Teslim edildi', text: 'Artık pişirme moduna geçilebilir.', icon: 'home-outline' },
] as const;

const formatPrice = (value: number) => `₺${value.toFixed(0)}`;

export function InvestorDemoFlowScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const [transferredPlanId, setTransferredPlanId] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const [cookingVisible, setCookingVisible] = useState(false);
  const { showToast, showDemoModal } = useFeedback();

  const recipes = useAppStore((store) => store.recipes);
  const smartBasket = useAppStore((store) => store.smartBasket);
  const setPantryText = useAppStore((store) => store.setPantryText);
  const createSmartBasketPlan = useAppStore((store) => store.createSmartBasketPlan);
  const selectSmartBasketPlan = useAppStore((store) => store.selectSmartBasketPlan);
  const addSmartBasketItemsToCart = useAppStore((store) => store.addSmartBasketItemsToCart);
  const completeSmartBasketDemo = useAppStore((store) => store.completeSmartBasketDemo);

  const plans = smartBasket.plans;
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0],
    [plans, selectedPlanId],
  );
  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedPlan?.recipeId),
    [recipes, selectedPlan?.recipeId],
  );
  const missingTotal = selectedPlan?.missingTotal ?? 0;
  const demoTotal = missingTotal + 18;
  const progressStep = Math.max(1, Math.min(totalSteps, step + 1));

  const startDemo = () => {
    setPantryText(demoIngredients.join(', '));
    const generatedPlans = createSmartBasketPlan({
      ingredients: demoIngredients,
      servings: 3,
      budgetModeId: 'under-250',
      recipeId: 'recipe-tavuklu-makarna',
    });
    const firstPlan = generatedPlans[0];

    if (firstPlan) {
      selectSmartBasketPlan(firstPlan.id);
      setSelectedPlanId(firstPlan.id);
    }

    setTransferredPlanId(undefined);
    setStep(1);
    showToast('Yatırımcı demo senaryosu hazırlandı.', 'info');
  };

  const choosePlan = (plan: SmartBasketPlan) => {
    selectSmartBasketPlan(plan.id);
    setSelectedPlanId(plan.id);

    if (transferredPlanId !== plan.id) {
      addSmartBasketItemsToCart(plan.id);
      completeSmartBasketDemo();
      setTransferredPlanId(plan.id);
      showToast('Eksik malzemeler akıllı sepete eklendi.');
    }

    setStep(3);
  };

  const confirmDemoOrder = async () => {
    if (!selectedPlan) {
      showToast('Önce bir demo tarif seç.', 'warning');
      return;
    }

    setConfirming(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 850);
    });
    setConfirming(false);
    setStep(5);
    showToast('Demo sipariş takip ekranı hazır.', 'info');
  };

  const closeDemo = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const goBack = () => {
    if (step === 0) {
      closeDemo();
      return;
    }

    setStep((value) => Math.max(0, value - 1));
  };

  const finishCooking = () => {
    setCookingVisible(false);
    setStep(6);
    showToast('Afiyet olsun! Demo pişirme akışı tamamlandı.');
  };

  const renderIntro = () => (
    <View style={styles.heroCard}>
      <View style={styles.logoWrap}>
        <BrandLogo size={86} />
      </View>
      <View style={styles.badge}>
        <Ionicons name="play-circle" size={15} color={theme.colors.primary} />
        <Text style={styles.badgeText}>Kontrollü yatırımcı sunumu</Text>
      </View>
      <Text style={styles.heroTitle}>TarifAL nasıl çalışır?</Text>
      <Text style={styles.heroText}>
        TarifAL, kullanıcının evindeki malzemelere göre tarif önerir, eksikleri akıllı sepete ekler
        ve demo sipariş akışıyla pişirme moduna kadar götürür.
      </Text>
      <View style={styles.flowPills}>
        {['AI öneri', 'Akıllı sepet', 'Demo sipariş', 'Pişirme modu'].map((item) => (
          <View key={item} style={styles.flowPill}>
            <Text style={styles.flowPillText}>{item}</Text>
          </View>
        ))}
      </View>
      <AppButton title="Demoyu Başlat" icon="sparkles" onPress={startDemo} />
    </View>
  );

  const renderAiStep = () => (
    <View style={styles.sectionCard}>
      <StepLabel label="AI Şef adımı" />
      <Text style={styles.sectionTitle}>Demo senaryo: Evde ne var?</Text>
      <Text style={styles.sectionText}>
        Kullanıcı evdeki malzemeleri girer. TarifAL bu veriyi tarif, bütçe ve market eksikleriyle
        eşleştirir.
      </Text>
      <View style={styles.ingredientRow}>
        {demoIngredients.map((ingredient) => (
          <View key={ingredient} style={styles.ingredientChip}>
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
      <View style={styles.aiCard}>
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={19} color={theme.colors.primary} />
        </View>
        <View style={styles.aiCopy}>
          <Text style={styles.aiTitle}>TarifAL AI Şef</Text>
          <Text style={styles.aiText}>
            Makarna, yoğurt ve domates ile baktım. Sana uygun 3 tarif seçtim; öne çıkan tarifin
            eksikleri tek tıkla sepete aktarılabilir.
          </Text>
          <Text style={styles.demoNote}>Demo modunda simüle edildi</Text>
        </View>
      </View>
      <AppButton title="Tarif Önerilerini Göster" icon="restaurant-outline" onPress={() => setStep(2)} />
    </View>
  );

  const renderRecipeStep = () => (
    <View style={styles.sectionCard}>
      <StepLabel label="Tarif önerisi" />
      <Text style={styles.sectionTitle}>AI 3 plan önerdi</Text>
      <Text style={styles.sectionText}>
        Öne çıkan plan, malzeme uyumu ve sepete dönüşüm potansiyeline göre seçildi.
      </Text>
      <View style={styles.planList}>
        {plans.slice(0, 3).map((plan, index) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => choosePlan(plan)}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`${plan.recipeTitle} tarifini seç`}
            style={[styles.planCard, index === 0 && styles.featuredPlan]}
          >
            <Image source={{ uri: plan.recipeImage }} style={styles.planImage} />
            <View style={styles.planCopy}>
              <View style={styles.planTop}>
                <Text style={styles.planTitle}>{plan.recipeTitle}</Text>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>%{plan.matchPercent}</Text>
                </View>
              </View>
              <Text style={styles.planMeta}>
                {plan.prepTime} dk · {plan.difficulty} · {formatPrice(plan.estimatedCost)}
              </Text>
              <Text style={styles.planText} numberOfLines={2}>
                {plan.missingIngredients.length} eksik ürün · Sana uygunluk %{plan.suitabilityScore}
              </Text>
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>{index === 0 ? 'Bu tarifi seç' : 'Planı seç'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMissingStep = () => (
    <View style={styles.sectionCard}>
      <StepLabel label="Eksikleri sepete ekleme" />
      <Text style={styles.sectionTitle}>Eksik malzemeler akıllı sepete eklendi</Text>
      <Text style={styles.sectionText}>
        Seçilen tarif için eksik ürünler Demo Market sepetine dönüştürüldü. Bu adım TarifAL’in
        gelir modelini gösterir.
      </Text>
      <MissingList ingredients={selectedPlan?.missingIngredients ?? []} />
      <View style={styles.summaryBand}>
        <Metric label="Eksik ürün" value={`${selectedPlan?.missingIngredients.length ?? 0}`} />
        <Metric label="Ürün toplamı" value={formatPrice(missingTotal)} />
        <Metric label="Komisyon" value={formatPrice(selectedPlan?.estimatedCommission ?? 18)} />
      </View>
      <AppButton title="Akıllı Siparişe Geç" icon="cart-outline" onPress={() => setStep(4)} />
    </View>
  );

  const renderOrderStep = () => (
    <View style={styles.sectionCard}>
      <StepLabel label="Akıllı sipariş" />
      <Text style={styles.sectionTitle}>Demo market sepeti</Text>
      <Text style={styles.sectionText}>
        Bu işlem gerçek sipariş oluşturmaz. Yatırımcı demosu için market entegrasyonu ve ödeme akışı
        simüle edilir.
      </Text>
      <View style={styles.marketCard}>
        <View style={styles.marketHeader}>
          <View>
            <Text style={styles.marketTitle}>{demoSmartBasketMarket.name}</Text>
            <Text style={styles.marketText}>Tahmini teslimat: {demoSmartBasketMarket.deliveryEstimate}</Text>
          </View>
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>Demo</Text>
          </View>
        </View>
        <MissingList ingredients={selectedPlan?.missingIngredients ?? []} compact />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Demo toplam</Text>
          <Text style={styles.totalValue}>{formatPrice(demoTotal)}</Text>
        </View>
      </View>
      <InvestorConversionStrip compact />
      <AppButton
        title={confirming ? 'Demo sipariş hazırlanıyor...' : 'Demo Siparişi Onayla'}
        icon="checkmark-circle"
        loading={confirming}
        onPress={confirmDemoOrder}
      />
      <AppButton title="Ürünleri Düzenle" icon="create-outline" variant="soft" onPress={() => setStep(3)} />
    </View>
  );

  const renderTrackingStep = () => (
    <View style={styles.sectionCard}>
      <StepLabel label="Sipariş takip" />
      <Text style={styles.sectionTitle}>Demo sipariş takip ekranı</Text>
      <Text style={styles.sectionText}>
        Sipariş gerçek markete iletilmez. Akış, tarifi market sepetinden pişirme moduna bağlar.
      </Text>
      <View style={styles.timeline}>
        {trackingSteps.map((item, index) => (
          <View key={item.id} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={styles.timelineDot}>
                <Ionicons name={item.icon} size={16} color="#FFFFFF" />
              </View>
              {index !== trackingSteps.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>
      <AppButton title="Tarifi Pişirmeye Geç" icon="restaurant" onPress={() => setCookingVisible(true)} />
      <AppButton
        title="Sipariş Detayları"
        icon="receipt-outline"
        variant="soft"
        onPress={() =>
          showDemoModal({
            title: 'Demo sipariş detayları',
            message: `${selectedPlan?.recipeTitle ?? 'Seçilen tarif'} için eksik ürünler ${
              demoSmartBasketMarket.name
            } ile eşleştirildi. Bu işlem gerçek ödeme veya sipariş oluşturmaz.`,
            primaryLabel: 'Tamam',
          })
        }
      />
    </View>
  );

  const renderFinalStep = () => (
    <View style={styles.heroCard}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={32} color="#FFFFFF" />
      </View>
      <Text style={styles.heroTitle}>TarifAL’in MVP akışı tamamlandı</Text>
      <Text style={styles.heroText}>
        Tek demo akışı içinde ana değer önerisi, ticari dönüşüm ve kullanıcı deneyimi gösterildi.
      </Text>
      <View style={styles.finalList}>
        {[
          'AI tarif önerisi',
          'Eksik malzeme tespiti',
          'Akıllı sepet',
          'Demo sipariş',
          'Sipariş takip',
          'Pişirme modu',
          'Market entegrasyonu ile gelir modeli',
        ].map((item) => (
          <View key={item} style={styles.finalItem}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
            <Text style={styles.finalText}>{item}</Text>
          </View>
        ))}
      </View>
      <AppButton title="Ana Sayfaya Dön" icon="home-outline" onPress={closeDemo} />
      <AppButton
        title="Demoyu Tekrar Başlat"
        icon="refresh"
        variant="soft"
        onPress={() => {
          setStep(0);
          setSelectedPlanId(undefined);
          setTransferredPlanId(undefined);
        }}
      />
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderIntro();
      case 1:
        return renderAiStep();
      case 2:
        return renderRecipeStep();
      case 3:
        return renderMissingStep();
      case 4:
        return renderOrderStep();
      case 5:
        return renderTrackingStep();
      default:
        return renderFinalStep();
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel={step === 0 ? 'Ana sayfaya dön' : 'Önceki demo adımına dön'}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.topCopy}>
          <Text style={styles.topTitle}>Yatırımcı Demo Modu</Text>
          <Text style={styles.topText}>{progressStep}/{totalSteps} sunum adımı</Text>
        </View>
        <TouchableOpacity
          onPress={closeDemo}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Demo akışını kapat"
          style={styles.iconButton}
        >
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(progressStep / totalSteps) * 100}%` }]} />
      </View>

      {renderStep()}

      {selectedRecipe ? (
        <CookingMode
          recipe={selectedRecipe}
          visible={cookingVisible}
          onClose={() => setCookingVisible(false)}
          onFinish={finishCooking}
        />
      ) : null}
    </Screen>
  );
}

function StepLabel({ label }: { label: string }) {
  return (
    <View style={styles.stepLabel}>
      <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
      <Text style={styles.stepLabelText}>{label}</Text>
    </View>
  );
}

function MissingList({ ingredients, compact = false }: { ingredients: Ingredient[]; compact?: boolean }) {
  if (ingredients.length === 0) {
    return (
      <View style={styles.emptyMissing}>
        <Ionicons name="checkmark-done-outline" size={18} color={theme.colors.success} />
        <Text style={styles.emptyMissingText}>Bu plan için eksik ürün görünmüyor.</Text>
      </View>
    );
  }

  return (
    <View style={compact ? styles.compactList : styles.missingList}>
      {ingredients.map((ingredient) => (
        <View key={ingredient.id} style={styles.missingRow}>
          <View style={styles.missingIcon}>
            <Ionicons name="add" size={15} color={theme.colors.primary} />
          </View>
          <View style={styles.missingCopy}>
            <Text style={styles.missingName}>{ingredient.name}</Text>
            <Text style={styles.missingMeta}>{ingredient.gram} gr</Text>
          </View>
          <Text style={styles.missingPrice}>{formatPrice(ingredient.price)}</Text>
        </View>
      ))}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingTop: 16,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    flex: 1,
    alignItems: 'center',
  },
  topTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  topText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 20,
    gap: 16,
    ...theme.shadow,
    shadowOpacity: 0.06,
  },
  logoWrap: {
    alignSelf: 'center',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 12,
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
    lineHeight: 22,
    fontWeight: '700',
  },
  flowPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flowPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  flowPillText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  stepLabel: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepLabelText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  sectionText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  ingredientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ingredientText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  aiCard: {
    borderRadius: 20,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCopy: {
    flex: 1,
  },
  aiTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  aiText: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  demoNote: {
    marginTop: 9,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  planList: {
    gap: 12,
  },
  planCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  featuredPlan: {
    borderColor: '#FFBE98',
    backgroundColor: '#FFF8F4',
  },
  planImage: {
    width: 86,
    minHeight: 112,
    borderRadius: 18,
    backgroundColor: theme.colors.border,
  },
  planCopy: {
    flex: 1,
    gap: 6,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  planTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  percentBadge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  percentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  planMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  planText: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  selectButton: {
    marginTop: 4,
    minHeight: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  missingList: {
    gap: 9,
  },
  compactList: {
    gap: 7,
  },
  missingRow: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  missingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingCopy: {
    flex: 1,
  },
  missingName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  missingMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  missingPrice: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyMissing: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyMissingText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryBand: {
    borderRadius: 20,
    backgroundColor: '#FFF3EA',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  marketCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF9F5',
    padding: 14,
    gap: 12,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  marketTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  marketText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  demoPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  demoPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#FFE0CF',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  totalValue: {
    color: theme.colors.primary,
    fontSize: 21,
    fontWeight: '900',
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 32,
    backgroundColor: '#FFE0CF',
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: 18,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  timelineText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalList: {
    gap: 10,
  },
  finalItem: {
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  finalText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
});
