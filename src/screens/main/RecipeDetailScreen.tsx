import { useMemo, useState } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CookingMode } from '../../components/CookingMode';
import { IngredientCard } from '../../components/IngredientCard';
import { MissingIngredientsBox } from '../../components/MissingIngredientsBox';
import { VoiceKitchenMode } from '../../components/VoiceKitchenMode';
import { theme } from '../../constants/theme';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { MarketAlternative } from '../../types';
import { getRecipeCost, getRecipeMatch, parsePantryText } from '../../utils/recipeMatching';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export function RecipeDetailScreen({ navigation, route }: Props) {
  const [cookingVisible, setCookingVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [madeFeedback, setMadeFeedback] = useState('');
  const insets = useSafeAreaInsets();
  const recipe = useAppStore((store) =>
    store.recipes.find((item) => item.id === route.params.recipeId),
  );
  const likes = useAppStore((store) => store.likes);
  const recipeLists = useAppStore((store) => store.recipeLists);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const toggleRecipeList = useAppStore((store) => store.toggleRecipeList);
  const addIngredientToCart = useAppStore((store) => store.addIngredientToCart);
  const addRecipeToCart = useAppStore((store) => store.addRecipeToCart);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const pantryText = useAppStore((store) => store.pantryText);
  const match = useMemo(
    () => (recipe ? getRecipeMatch(recipe, parsePantryText(pantryText)) : undefined),
    [pantryText, recipe],
  );

  if (!recipe || !match) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Tarif bulunamadı</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Geri dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liked = Boolean(likes[recipe.id]);
  const savedForLater = recipeLists.cookLater.includes(recipe.id);
  const cost = getRecipeCost(recipe);

  const handleAddIngredient = (ingredientId: string, alternative?: MarketAlternative) => {
    const ingredient = recipe.ingredients.find((item) => item.id === ingredientId);

    if (!ingredient) {
      return;
    }

    addIngredientToCart(recipe, ingredient, alternative);
    Alert.alert('Sepete eklendi', `${alternative?.name ?? ingredient.name} sepetine eklendi.`);
  };

  const handleAddAll = () => {
    addRecipeToCart(recipe.id);
    Alert.alert('Sepete eklendi', `${recipe.title} için tüm malzemeler sepete eklendi.`);
  };

  const handleAddMissing = () => {
    addMissingIngredientsToCart(recipe.id);
    Alert.alert('Eksikler sepette', `${recipe.title} için eksik ürünler sepete eklendi.`);
  };

  const handleSmartBasket = () => {
    navigation.navigate('SmartBasket', { recipeId: recipe.id });
  };

  const handleMadeRecipe = () => {
    toggleRecipeList('cookedBefore', recipe.id);
    setMadeFeedback('Eline sağlık! Bu tarifi mutfak geçmişine ekledik. İlk Tarif rozeti güncellendi.');
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ImageBackground source={{ uri: recipe.imageUrl }} style={styles.hero} imageStyle={styles.heroImage}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.86}
            style={[styles.floatingButton, styles.backButton, { top: insets.top + 12 }]}
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleLike(recipe.id)}
            activeOpacity={0.86}
            style={[styles.floatingButton, styles.likeButton, { top: insets.top + 12 }]}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? theme.colors.primary : theme.colors.text} />
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.meta}>❤ {recipe.likes} beğeni  •  {recipe.createdByName}</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          <TouchableOpacity onPress={() => setCookingVisible(true)} activeOpacity={0.86} style={styles.cookingButton}>
            <Ionicons name="play-circle" size={20} color="#FFFFFF" />
            <Text style={styles.cookingButtonText}>Pişirme Modu</Text>
          </TouchableOpacity>

          <View style={styles.premiumActionCard}>
            <View style={styles.premiumActionHeader}>
              <View style={styles.premiumActionCopy}>
                <Text style={styles.premiumActionTitle}>Mutfak deneyimini takip et</Text>
                <Text style={styles.premiumActionSubtitle}>
                  Tarifi tamamladığında geçmişine ekle veya sesli mutfak demo modunu dene.
                </Text>
              </View>
              <View style={styles.premiumActionIcon}>
                <Ionicons name="sparkles" size={19} color={theme.colors.primary} />
              </View>
            </View>
            <View style={styles.premiumActionButtons}>
              <TouchableOpacity onPress={handleMadeRecipe} activeOpacity={0.85} style={styles.doneButton}>
                <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
                <Text style={styles.doneButtonText}>Tarifi Yaptım</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVoiceVisible(true)} activeOpacity={0.85} style={styles.voiceButton}>
                <Ionicons name="mic-outline" size={17} color={theme.colors.primary} />
                <Text style={styles.voiceButtonText}>Sesli Mutfak Modu</Text>
              </TouchableOpacity>
            </View>
            {madeFeedback ? <Text style={styles.madeFeedback}>{madeFeedback}</Text> : null}
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity onPress={() => toggleLike(recipe.id)} activeOpacity={0.85} style={styles.quickButton}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={17} color={theme.colors.primary} />
              <Text style={styles.quickButtonText}>{liked ? 'Favorilerde' : 'Favorilere Ekle'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleRecipeList('cookLater', recipe.id)} activeOpacity={0.85} style={styles.quickButton}>
              <Ionicons name={savedForLater ? 'bookmark' : 'bookmark-outline'} size={17} color={theme.colors.primary} />
              <Text style={styles.quickButtonText}>{savedForLater ? 'Planlandı' : 'Sonra Pişireceğim'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.infoValue}>{recipe.prepTime} dk</Text>
              <Text style={styles.infoLabel}>Süre</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="people-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.infoValue}>{recipe.servings}</Text>
              <Text style={styles.infoLabel}>Porsiyon</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="speedometer-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.infoValue}>{recipe.difficulty}</Text>
              <Text style={styles.infoLabel}>Zorluk</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="flame-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.infoValue}>{recipe.calories}</Text>
              <Text style={styles.infoLabel}>Kalori</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="wallet-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.infoValue}>₺{cost.toFixed(0)}</Text>
              <Text style={styles.infoLabel}>Tahmini fiyat</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="checkmark-done-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.infoValue}>%{match.matchPercent}</Text>
              <Text style={styles.infoLabel}>Malzeme uyumu</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.matchGrid}>
            <View style={[styles.matchCard, styles.availableCard]}>
              <Text style={styles.matchTitle}>Var Olan Malzemeler</Text>
              {match.matchedIngredients.length === 0 ? (
                <Text style={styles.matchEmpty}>Henüz eşleşen malzeme yok.</Text>
              ) : (
                match.matchedIngredients.map((ingredient) => (
                  <Text key={ingredient.id} style={styles.matchItem}>✓ {ingredient.name}</Text>
                ))
              )}
            </View>
            <View style={[styles.matchCard, styles.missingCard]}>
              <Text style={styles.matchTitle}>Eksik Malzemeler</Text>
              {match.missingIngredients.length === 0 ? (
                <Text style={styles.matchEmpty}>Tarif tam uyumlu.</Text>
              ) : (
                match.missingIngredients.map((ingredient) => (
                  <Text key={ingredient.id} style={styles.missingItem}>+ {ingredient.name}</Text>
                ))
              )}
            </View>
          </View>

          <MissingIngredientsBox ingredients={match.missingIngredients} onAddMissing={handleAddMissing} />

          <TouchableOpacity onPress={handleSmartBasket} activeOpacity={0.86} style={styles.smartBasketButton}>
            <View style={styles.smartBasketButtonIcon}>
              <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.smartBasketButtonCopy}>
              <Text style={styles.smartBasketButtonTitle}>Eksikleri Akıllı Sepet'e aktar</Text>
              <Text style={styles.smartBasketButtonText}>
                Bu tarifi kişi sayısı ve bütçeyle market sepetine dönüştür.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={styles.rowHeader}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            <TouchableOpacity onPress={handleAddAll} activeOpacity={0.75}>
              <Text style={styles.addAll}>Hepsini Sepete +</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ingredients}>
            {recipe.ingredients.map((ingredient) => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                onOrder={(alternative) => handleAddIngredient(ingredient.id, alternative)}
              />
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.stepsTitle]}>Hazırlanışı</Text>
          <View style={styles.steps}>
            {recipe.steps.map((step, index) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepIndex}>
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, styles.commentsTitle]}>Yorumlar (0)</Text>
          <View style={styles.commentBox}>
            <TextInput
              placeholder="Bu tarif için yorumun..."
              placeholderTextColor={theme.colors.subtle}
              multiline
              style={styles.commentInput}
            />
            <View style={styles.commentDivider} />
            <TextInput
              placeholder='Malzeme önerisi (opsiyonel) - örn: "Üzerine kekik"'
              placeholderTextColor={theme.colors.subtle}
              style={styles.suggestionInput}
            />
          </View>
        </View>
      </ScrollView>
      <CookingMode recipe={recipe} visible={cookingVisible} onClose={() => setCookingVisible(false)} />
      <VoiceKitchenMode recipe={recipe} visible={voiceVisible} onClose={() => setVoiceVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  hero: {
    height: 332,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  floatingButton: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
    shadowOpacity: 0.08,
  },
  backButton: {
    left: 20,
  },
  likeButton: {
    right: 20,
  },
  body: {
    paddingHorizontal: theme.screen.padding,
    paddingTop: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 14,
    color: theme.colors.text,
    fontSize: 27,
    fontWeight: '900',
  },
  meta: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    marginTop: 18,
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  cookingButton: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
  },
  cookingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  premiumActionCard: {
    marginTop: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 12,
  },
  premiumActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  premiumActionCopy: {
    flex: 1,
  },
  premiumActionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  premiumActionSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  premiumActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActionButtons: {
    flexDirection: 'row',
    gap: 9,
  },
  doneButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  voiceButton: {
    flex: 1.15,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  voiceButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  madeFeedback: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  quickActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
  },
  quickButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  infoGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoCard: {
    width: '47.8%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  infoLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  tagRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  matchGrid: {
    marginTop: 18,
    gap: 10,
  },
  matchCard: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 14,
    gap: 7,
  },
  availableCard: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  missingCard: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.primarySoft,
  },
  matchTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  matchItem: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '800',
  },
  missingItem: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  smartBasketButton: {
    marginTop: 14,
    minHeight: 74,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  smartBasketButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartBasketButtonCopy: {
    flex: 1,
  },
  smartBasketButtonTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  smartBasketButtonText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  matchEmpty: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  rowHeader: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  addAll: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  ingredients: {
    marginTop: 14,
    gap: 10,
  },
  stepsTitle: {
    marginTop: 32,
  },
  steps: {
    marginTop: 14,
    gap: 15,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  commentsTitle: {
    marginTop: 34,
  },
  commentBox: {
    marginTop: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  commentInput: {
    minHeight: 78,
    padding: 16,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  commentDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  suggestionInput: {
    minHeight: 46,
    paddingHorizontal: 16,
    color: theme.colors.text,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  emptyButton: {
    marginTop: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
