import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CookingMode } from '../../components/CookingMode';
import { DataSyncBanner } from '../../components/DataSyncBanner';
import { BrandSelector } from '../../components/BrandSelector';
import { CommentInput } from '../../components/CommentInput';
import { CommentList } from '../../components/CommentList';
import { FollowButton } from '../../components/FollowButton';
import { FeedbackPromptButton } from '../../components/FeedbackPromptButton';
import { IngredientImageItem } from '../../components/IngredientImageItem';
import { MarketBasketSummary } from '../../components/MarketBasketSummary';
import { RestaurantOrderOptions } from '../../components/RestaurantOrderOptions';
import { ShareRecipeModal } from '../../components/ShareRecipeModal';
import { SponsoredProductCard } from '../../components/SponsoredProductCard';
import { TriedRecipeModal } from '../../components/TriedRecipeModal';
import { UserAvatar } from '../../components/UserAvatar';
import { VoiceKitchenMode } from '../../components/VoiceKitchenMode';
import { MiniSurveyModal } from '../../components/MiniSurveyModal';
import { RecipeHero } from '../../components/recipe/RecipeHero';
import { RecipePrimaryActionCard } from '../../components/recipe/RecipePrimaryActionCard';
import { SmartIngredientGroups } from '../../components/recipe/SmartIngredientGroups';
import { theme } from '../../constants/theme';
import {
  commerceMarketDemo,
  enrichIngredientForCommerce,
  getBrandOptionsForIngredient,
  getRestaurantsForRecipe,
} from '../../data/demoCommerce';
import { formatFollowerCount, mockSocialUsers } from '../../data/mockSocial';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useUserTasteProfile } from '../../personalization/useUserTasteProfile';
import { trackEvent } from '../../services/analyticsService';
import {
  getSponsoredProductsForRecipe,
  trackSponsoredAlternativeViewed,
  trackSponsoredClick,
  trackSponsoredImpression,
} from '../../services/sponsoredPlacementService';
import { useAppStore } from '../../store/useAppStore';
import { Ingredient, IngredientBrandOption, PurchaseMode, RestaurantOption, SocialUser, SponsoredProduct } from '../../types';
import { isFounderUser } from '../../utils/profileIdentity';
import { getRecipeCost, getRecipeMatch, normalizeIngredientText, parsePantryText } from '../../utils/recipeMatching';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

const getAlternativeSuggestions = (missingIngredients: Ingredient[]) => {
  const missingNames = missingIngredients.map((ingredient) => ingredient.name.toLocaleLowerCase('tr-TR'));
  const suggestions: string[] = [];

  if (missingNames.some((name) => name.includes('krema'))) {
    suggestions.push('Krema yoksa yoğurt kullanabilirsin.');
  }
  if (missingNames.some((name) => name.includes('parmesan'))) {
    suggestions.push('Parmesan yerine kaşar peyniri tercih edebilirsin.');
  }
  if (missingNames.some((name) => name.includes('tereyağı'))) {
    suggestions.push('Tereyağı yerine zeytinyağıyla daha hafif bir sonuç elde edebilirsin.');
  }
  if (missingNames.some((name) => name.includes('tavuk'))) {
    suggestions.push('Tavuk yerine hindi eti kullanarak aynı tarifi hazırlayabilirsin.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Benzer ürünleri TarifAL Sepet’te marka ve fiyatlarına göre karşılaştırabilirsin.');
  }

  return suggestions.slice(0, 2);
};

export function RecipeDetailScreen({ navigation, route }: Props) {
  const [cookingVisible, setCookingVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [madeFeedback, setMadeFeedback] = useState('');
  const [triedVisible, setTriedVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>(route.params.purchaseMode ?? 'home');
  const [selectedBrands, setSelectedBrands] = useState<Record<string, string>>({});
  const [brandSelectorIngredientId, setBrandSelectorIngredientId] = useState<string>();
  const [missingSurveyTrigger, setMissingSurveyTrigger] = useState(0);
  const { showToast, showDemoModal } = useFeedback();
  const { recordChefFollow, recordRecipeInteraction, recordTagInteraction } = useUserTasteProfile();
  const insets = useSafeAreaInsets();
  const recipe = useAppStore((store) =>
    store.recipes.find((item) => item.id === route.params.recipeId),
  );
  const likes = useAppStore((store) => store.likes);
  const pendingFavoriteIds = useAppStore((store) => store.pendingFavoriteIds);
  const dataError = useAppStore((store) => store.dataError);
  const recipeLists = useAppStore((store) => store.recipeLists);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const toggleRecipeList = useAppStore((store) => store.toggleRecipeList);
  const addIngredientToCart = useAppStore((store) => store.addIngredientToCart);
  const addSponsoredProductToCart = useAppStore((store) => store.addSponsoredProductToCart);
  const addRestaurantMealToCart = useAppStore((store) => store.addRestaurantMealToCart);
  const socialComments = useAppStore((store) => store.socialComments);
  const socialPostStats = useAppStore((store) => store.socialPostStats);
  const socialPosts = useAppStore((store) => store.socialPosts);
  const followedUsers = useAppStore((store) => store.followedUsers);
  const currentUser = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const accountMode = useAppStore((store) => store.accountMode);
  const toggleFollowUser = useAppStore((store) => store.toggleFollowUser);
  const addSocialComment = useAppStore((store) => store.addSocialComment);
  const toggleCommentLike = useAppStore((store) => store.toggleCommentLike);
  const addTriedRecipe = useAppStore((store) => store.addTriedRecipe);
  const pantryText = useAppStore((store) => store.pantryText);
  const usersById = useMemo(
    () => {
      const currentSocialUser: SocialUser = {
        id: currentUser?.id ?? 'demo-user',
        name: currentUser?.name ?? 'TarifAL Kullanıcısı',
        username: `@${(currentUser?.name ?? 'tarifal_kullanici').toLocaleLowerCase('tr-TR').replace(/\s+/g, '')}`,
        avatarUrl:
          currentUser?.avatarUrl ??
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
        coverImageUrl:
          'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop',
        bio: 'TarifAL toplulugunda pratik ve sepetlenebilir tarifler paylasiyor.',
        location: 'Istanbul',
        followers: 128,
        following: 24,
        recipeCount: 1,
        totalLikes: 0,
        averageRating: 4.6,
        badges: ['Mutfak Ciragi', 'Ilk Tarif'],
        level: 'Mutfak Ciragi',
        expertiseAreas: ['Pratik yemek', 'Evde yap'],
      };

      return [currentSocialUser, ...mockSocialUsers].reduce<Record<string, SocialUser>>((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    },
    [currentUser],
  );
  const match = useMemo(
    () => (recipe ? getRecipeMatch(recipe, parsePantryText(pantryText)) : undefined),
    [pantryText, recipe],
  );
  const sponsoredRecipeProduct = useMemo(
    () => (recipe ? getSponsoredProductsForRecipe(recipe, 'recipe_detail', 1)[0] : undefined),
    [recipe],
  );
  const showTestingTools = Boolean(isFounderUser(currentUser) || profile?.isBetaTester || currentUser?.isBetaTester);

  useEffect(() => {
    if (route.params.openCooking) {
      setCookingVisible(true);
    }
  }, [route.params.openCooking]);

  useEffect(() => {
    if (route.params.purchaseMode) {
      setPurchaseMode(route.params.purchaseMode);
    }
  }, [route.params.purchaseMode]);

  useEffect(() => {
    if (recipe) {
      recordRecipeInteraction(recipe, 'view');
      void trackEvent('recipe_opened', {
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        cartTotal: getRecipeCost(recipe),
        sourceScreen: 'RecipeDetail',
        isDemoMode: accountMode === 'demo',
      });
    }
  }, [accountMode, currentUser?.email, currentUser?.id, recipe, recordRecipeInteraction]);

  useEffect(() => {
    if (!recipe || !sponsoredRecipeProduct) {
      return;
    }

    trackSponsoredImpression(sponsoredRecipeProduct, 'recipe_detail', {
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      sourceScreen: 'RecipeDetail',
      isDemoMode: accountMode === 'demo',
    });
  }, [accountMode, currentUser?.email, currentUser?.id, recipe, sponsoredRecipeProduct]);

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
  const favoriteLoading = Boolean(pendingFavoriteIds[recipe.id]);
  const socialPost =
    socialPosts.find((post) => post.id === route.params.socialPostId) ??
    socialPosts.find((post) => post.recipeId === recipe.id);
  const socialAuthor = socialPost ? usersById[socialPost.authorId] : undefined;
  const socialStats = socialPost
    ? socialPostStats[socialPost.id] ?? {
        likes: socialPost.likes,
        commentsCount: socialPost.commentsCount,
        saves: socialPost.saves,
      }
    : undefined;
  const postComments = socialPost ? socialComments[socialPost.id] ?? [] : [];
  const savedForLater = recipeLists.cookLater.includes(recipe.id);
  const cost = getRecipeCost(recipe);
  const marketIngredients = recipe.ingredients.map((ingredient) => {
    const enrichedIngredient = enrichIngredientForCommerce(ingredient);
    const brands = getBrandOptionsForIngredient(enrichedIngredient);
    const selectedBrand =
      brands.find((brand) => brand.id === selectedBrands[ingredient.id]) ?? brands[0];

    return {
      ingredient: enrichedIngredient,
      brands,
      selectedBrand,
    };
  });
  const missingIngredientIds = new Set(match.missingIngredients.map((ingredient) => ingredient.id));
  const marketBasketIngredients = marketIngredients.filter((item) =>
    missingIngredientIds.has(item.ingredient.id),
  );
  const marketTotal = marketBasketIngredients.reduce((sum, item) => sum + item.selectedBrand.price, 0);
  const brandSelectorItem = marketIngredients.find(
    (item) => item.ingredient.id === brandSelectorIngredientId,
  );
  const restaurantOptions = getRestaurantsForRecipe(recipe.id);
  const alternativeSuggestions = getAlternativeSuggestions(match.missingIngredients);
  const featuredRestaurant = [...restaurantOptions].sort((first, second) => {
    const firstTotal = first.portionPrice + first.deliveryFee;
    const secondTotal = second.portionPrice + second.deliveryFee;

    return firstTotal - secondTotal;
  })[0];
  const featuredRestaurantTotal = featuredRestaurant
    ? featuredRestaurant.portionPrice + featuredRestaurant.deliveryFee
    : undefined;

  const handleBrandSelect = (ingredientId: string, brand: IngredientBrandOption) => {
    setSelectedBrands((current) => ({
      ...current,
      [ingredientId]: brand.id,
    }));
    if (brand.sponsored && sponsoredRecipeProduct) {
      trackSponsoredAlternativeViewed(sponsoredRecipeProduct, 'missing_items', {
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        sourceScreen: 'BrandSelector',
        isDemoMode: accountMode === 'demo',
      });
    }
    showToast(`${brand.name} seçildi. Market toplamı güncellendi.`, 'info');
  };

  const findSponsoredIngredientId = (product: SponsoredProduct) =>
    marketIngredients.find(({ ingredient }) =>
      product.targetIngredients.some((target) => {
        const normalizedTarget = normalizeIngredientText(target);
        const normalizedIngredient = normalizeIngredientText(ingredient.name);
        return normalizedTarget.includes(normalizedIngredient) || normalizedIngredient.includes(normalizedTarget);
      }),
    )?.ingredient.id;

  const handleSponsoredAdd = (product: SponsoredProduct) => {
    trackSponsoredClick(product, 'recipe_detail', {
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      sourceScreen: 'RecipeDetail',
      isDemoMode: accountMode === 'demo',
    });
    addSponsoredProductToCart(product, {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      placementType: 'recipe_detail',
    });
    showToast(`${product.productName} TarifAL Sepet'e eklendi.`, 'success');
  };

  const handleSponsoredAlternatives = (product: SponsoredProduct) => {
    const ingredientId = findSponsoredIngredientId(product);

    trackSponsoredAlternativeViewed(product, 'recipe_detail', {
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      sourceScreen: 'RecipeDetail',
      isDemoMode: accountMode === 'demo',
    });

    if (ingredientId) {
      setPurchaseMode('market');
      setBrandSelectorIngredientId(ingredientId);
      return;
    }

    setPurchaseMode('market');
    showToast('Marka ve fiyat seçenekleri açıldı.', 'info');
  };

  const handleAddMarketIngredients = () => {
    if (marketBasketIngredients.length === 0) {
      showToast('Bu tarif için eksik malzeme görünmüyor. Evde yap seçeneği daha mantıklı.', 'info');
      setPurchaseMode('home');
      return;
    }

    marketBasketIngredients.forEach(({ ingredient, selectedBrand }) => {
      addIngredientToCart(recipe, ingredient, {
        id: selectedBrand.id,
        name: selectedBrand.name,
        gram: ingredient.gram,
        price: selectedBrand.price,
        note: `${selectedBrand.size} • ${selectedBrand.quality}`,
      });
    });
    setMissingSurveyTrigger((value) => value + 1);

    showDemoModal({
      title: 'Market sepeti hazır',
      message: `${recipe.title} için ${marketBasketIngredients.length} eksik ürün ${commerceMarketDemo.marketName} sepetine aktarıldı. Marka seçimlerine göre toplam ₺${marketTotal.toFixed(2)} olarak güncellendi.`,
      primaryLabel: 'Akıllı Siparişe Geç',
      secondaryLabel: 'Sepete Git',
      onPrimary: () => navigation.navigate('MarketCheckout'),
      onSecondary: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
    });
  };

  const handleRestaurantAdd = (restaurant: RestaurantOption) => {
    addRestaurantMealToCart(recipe, restaurant);
    showDemoModal({
      title: 'Hazır yemek sepetine eklendi',
      message: `${restaurant.name} üzerinden ${recipe.title} restoran sepetine eklendi. Bu aşamada restorana sipariş iletilmez; hazır yemek akışı test modunda tamamlanır.`,
      primaryLabel: 'Sepete Git',
      secondaryLabel: 'Devam Et',
      onPrimary: () => navigation.navigate('MainTabs', { screen: 'Cart', params: { activeBasket: 'restaurant' } }),
    });
  };

  const handleAddMissing = () => {
    if (marketBasketIngredients.length === 0) {
      showToast('Dolabın hazır. Bu tarif için eksik ürün görünmüyor.', 'info');
      return;
    }

    marketBasketIngredients.forEach(({ ingredient, selectedBrand }) => {
      addIngredientToCart(recipe, ingredient, {
        id: selectedBrand.id,
        name: selectedBrand.name,
        gram: ingredient.gram,
        price: selectedBrand.price,
        note: `${selectedBrand.size} • ${selectedBrand.quality}`,
      });
    });
    setMissingSurveyTrigger((value) => value + 1);

    showDemoModal({
      title: 'Eksikler TarifAL Sepet’te',
      message: `${marketBasketIngredients.length} ürün TarifAL Sepet’e eklendi. Market toplamı seçili markalara göre ₺${marketTotal.toFixed(2)} olarak hazırlandı.`,
      primaryLabel: 'Sepete Git',
      secondaryLabel: 'Pişirme Moduna Geç',
      onPrimary: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
      onSecondary: () => setCookingVisible(true),
    });
  };

  const handlePrimaryRecipeAction = () => {
    if (marketBasketIngredients.length > 0) {
      handleAddMissing();
      return;
    }

    setCookingVisible(true);
  };

  const handleToggleLike = () => {
    if (favoriteLoading) {
      return;
    }

    if (!liked) {
      recordRecipeInteraction(recipe, 'like');
    }
    toggleLike(recipe.id);
    showToast(liked ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi.');
  };

  const handleCookLater = () => {
    if (!savedForLater) {
      recordRecipeInteraction(recipe, 'save');
    }
    toggleRecipeList('cookLater', recipe.id);
    showToast(savedForLater ? 'Sonra pişireceğim listesinden çıkarıldı.' : 'Sonra pişireceğim listesine eklendi.');
  };

  const handleSocialFollow = () => {
    if (!socialAuthor) {
      return;
    }

    const following = Boolean(followedUsers[socialAuthor.id]);
    if (!following) {
      recordChefFollow(socialAuthor);
    }
    toggleFollowUser(socialAuthor.id);
    showToast(following ? 'Takip bırakıldı.' : `${socialAuthor.name} takip ediliyor.`);
  };

  const handleSocialComment = (text: string) => {
    if (!socialPost) {
      showToast('Yorum bu oturumda kaydedildi.', 'info');
      return;
    }

    addSocialComment(socialPost.id, text);
    recordRecipeInteraction(recipe, 'comment');
    showToast('Yorum eklendi.');
  };

  const handleMadeRecipe = () => {
    setTriedVisible(true);
  };

  const handleTriedSubmit = (rating: number, comment: string) => {
    toggleRecipeList('cookedBefore', recipe.id);
    addTriedRecipe({
      recipeId: recipe.id,
      rating,
      comment,
      imageUrl: recipe.imageUrl,
    });
    setMadeFeedback('Eline sağlık! Deneyimin TarifAL topluluğuna eklendi.');
    showToast('Deneyimin paylaşıldı. TarifAL topluluğuna katkı sağladın.');
  };

  const handleCookingFinished = () => {
    toggleRecipeList('cookedBefore', recipe.id);
    showDemoModal({
      title: 'Afiyet olsun!',
      message: `${recipe.title} tamamlandı ve mutfak geçmişine eklendi. Bu tarifi favorilerine de eklemek ister misin?`,
      primaryLabel: liked ? 'Favorilerde' : 'Favorilere Ekle',
      secondaryLabel: 'Ana Sayfaya Dön',
      onPrimary: () => {
        if (!liked) {
          toggleLike(recipe.id);
          showToast('Tarif favorilerine eklendi.');
        }
      },
      onSecondary: () => navigation.navigate('MainTabs', { screen: 'Home' }),
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <RecipeHero
          recipe={recipe}
          matchPercent={match.matchPercent}
          missingCount={match.missingIngredients.length}
          liked={liked}
          favoriteLoading={favoriteLoading}
          safeTop={insets.top}
          onBack={() => navigation.goBack()}
          onToggleLike={handleToggleLike}
        />

        <View style={styles.body}>
          <DataSyncBanner message={dataError} />
          {showTestingTools ? <FeedbackPromptButton screenName="RecipeDetail" compact /> : null}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.meta}>❤ {recipe.likes} beğeni  •  {recipe.createdByName}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
          <Text style={styles.compatibilityLead}>
            Evindeki {match.matchedIngredients.length} malzemeyle yapılabilir, sadece {match.missingIngredients.length} ürün eksik.
          </Text>

          {socialPost && socialAuthor ? (
            <View style={styles.socialAuthorCard}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SocialProfile', { userId: socialAuthor.id })}
                activeOpacity={0.86}
                style={styles.socialAuthorMain}
              >
                <UserAvatar uri={socialAuthor.avatarUrl} name={socialAuthor.name} size={48} />
                <View style={styles.socialAuthorCopy}>
                  <View style={styles.socialAuthorNameRow}>
                    <Text style={styles.socialAuthorName}>{socialAuthor.name}</Text>
                    {socialAuthor.isVerified ? (
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                    ) : null}
                  </View>
                  <Text style={styles.socialAuthorMeta}>
                    {socialAuthor.level} • {formatFollowerCount(socialAuthor.followers)} takipçi
                  </Text>
                </View>
              </TouchableOpacity>
              <FollowButton
                following={Boolean(followedUsers[socialAuthor.id])}
                onPress={handleSocialFollow}
                compact
              />
              <View style={styles.socialStatsRow}>
                <Text style={styles.socialStatText}>❤ {socialStats?.likes.toLocaleString('tr-TR') ?? recipe.likes}</Text>
                <Text style={styles.socialStatText}>💬 {socialStats?.commentsCount.toLocaleString('tr-TR') ?? postComments.length}</Text>
                <Text style={styles.socialStatText}>🔖 {socialStats?.saves.toLocaleString('tr-TR') ?? 0}</Text>
              </View>
            </View>
          ) : null}

          <RecipePrimaryActionCard
            recipeTitle={recipe.title}
            matchPercent={match.matchPercent}
            matchedCount={match.matchedIngredients.length}
            missingItems={marketBasketIngredients.map(({ ingredient, selectedBrand }) => ({
              id: ingredient.id,
              name: ingredient.name,
              price: selectedBrand.price,
            }))}
            marketTotal={marketTotal}
            prepTime={recipe.prepTime}
            restaurantName={featuredRestaurant?.name}
            restaurantPrice={featuredRestaurantTotal}
            restaurantDelivery={featuredRestaurant?.deliveryEstimate}
            onPrimary={handlePrimaryRecipeAction}
            onOpenMarket={() => {
              setPurchaseMode(purchaseMode === 'market' ? 'home' : 'market');
              showToast('Marka ve fiyat seçenekleri açıldı.', 'info');
            }}
            onOpenRestaurant={() => {
              setPurchaseMode(purchaseMode === 'restaurant' ? 'home' : 'restaurant');
              showToast('Hazır yemek alternatifleri açıldı.', 'info');
            }}
            onStartCooking={() => setCookingVisible(true)}
          />

          {sponsoredRecipeProduct ? (
            <SponsoredProductCard
              product={sponsoredRecipeProduct}
              title="Bu tarif için uygun ürün"
              subtitle="Marka önerisi, eksik ürün ve tarif bağlamına göre gösterilir."
              onAddToCart={() => handleSponsoredAdd(sponsoredRecipeProduct)}
              onViewAlternatives={() => handleSponsoredAlternatives(sponsoredRecipeProduct)}
            />
          ) : null}

          {purchaseMode === 'market' ? (
            <View style={styles.commerceBlock}>
              <View style={styles.commerceLeadCard}>
                <View style={styles.commerceLeadIcon}>
                  <Ionicons name="pricetags-outline" size={19} color={theme.colors.primary} />
                </View>
                <View style={styles.commerceLeadCopy}>
                  <Text style={styles.commerceLeadTitle}>Markaya göre canlı fiyat</Text>
                  <Text style={styles.commerceLeadText}>
                    Her malzemede marka seçebilir, toplam market sepetini anında güncelleyebilirsin.
                  </Text>
                </View>
              </View>
              <MarketBasketSummary
                itemCount={marketBasketIngredients.length}
                total={marketTotal}
                onAddToCart={handleAddMarketIngredients}
              />
              {marketBasketIngredients.length === 0 ? (
                <View style={styles.noMissingCard}>
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
                  <View style={styles.noMissingCopy}>
                    <Text style={styles.noMissingTitle}>Eksik malzeme görünmüyor</Text>
                    <Text style={styles.noMissingText}>
                      Evdeki malzemelerle bu tarifi yapabilirsin; market maliyeti şu an ₺0.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.commerceList}>
                  {marketBasketIngredients.map(({ ingredient, selectedBrand }) => (
                    <IngredientImageItem
                      key={ingredient.id}
                      ingredient={ingredient}
                      brand={selectedBrand}
                      onPress={() => setBrandSelectorIngredientId(ingredient.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {purchaseMode === 'restaurant' ? (
            <View style={styles.commerceBlock}>
              <View style={styles.commerceLeadCard}>
                <View style={styles.commerceLeadIcon}>
                  <Ionicons name="restaurant-outline" size={19} color={theme.colors.primary} />
                </View>
                <View style={styles.commerceLeadCopy}>
                  <Text style={styles.commerceLeadTitle}>Aynı tarifi hazır sipariş et</Text>
                  <Text style={styles.commerceLeadText}>
                    TarifAL aynı yemeği sunan restoranları fiyat, puan ve teslimat süresine göre karşılaştırır.
                  </Text>
                </View>
              </View>
              <RestaurantOrderOptions
                restaurants={restaurantOptions}
                onAddRestaurant={handleRestaurantAdd}
              />
            </View>
          ) : null}

          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={handleToggleLike}
              disabled={favoriteLoading}
              activeOpacity={0.85}
              style={[styles.quickButton, favoriteLoading && styles.quickButtonDisabled]}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={17} color={theme.colors.primary} />
              <Text style={styles.quickButtonText}>
                {favoriteLoading ? 'Kaydediliyor...' : liked ? 'Favorilerde' : 'Favorilere Ekle'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCookLater} activeOpacity={0.85} style={styles.quickButton}>
              <Ionicons name={savedForLater ? 'bookmark' : 'bookmark-outline'} size={17} color={theme.colors.primary} />
              <Text style={styles.quickButtonText}>{savedForLater ? 'Planlandı' : 'Sonra Pişireceğim'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShareVisible(true)} activeOpacity={0.85} style={styles.quickButton}>
              <Ionicons name="share-social-outline" size={17} color={theme.colors.primary} />
              <Text style={styles.quickButtonText}>Paylaş</Text>
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
              <TouchableOpacity
                key={tag}
                onPress={() => {
                  recordTagInteraction(tag);
                  showToast(`#${tag} ilgi alanlarına eklendi.`, 'info');
                }}
                activeOpacity={0.8}
                style={styles.tag}
              >
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <SmartIngredientGroups
            matchedIngredients={match.matchedIngredients}
            missingIngredients={match.missingIngredients}
            alternatives={alternativeSuggestions}
          />

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

          <View style={styles.premiumActionCard}>
            <View style={styles.premiumActionHeader}>
              <View style={styles.premiumActionCopy}>
                <Text style={styles.premiumActionTitle}>Pişirdikten sonra</Text>
                <Text style={styles.premiumActionSubtitle}>
                  Tarifi tamamladığında mutfak geçmişine ekleyebilir veya sesli mutfak akışını deneyebilirsin.
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
                <Text style={styles.voiceButtonText}>Sesli Mutfak</Text>
              </TouchableOpacity>
            </View>
            {madeFeedback ? <Text style={styles.madeFeedback}>{madeFeedback}</Text> : null}
          </View>

          <Text style={[styles.sectionTitle, styles.commentsTitle]}>
            Yorumlar ({socialStats?.commentsCount ?? postComments.length})
          </Text>
          <View style={styles.socialCommentsBlock}>
            <CommentInput onSubmit={handleSocialComment} />
            <CommentList comments={postComments} usersById={usersById} onToggleLike={toggleCommentLike} />
          </View>
          {socialPost ? (
            <View style={styles.creatorMoreCard}>
              <Text style={styles.creatorMoreTitle}>Bu şefin diğer tarifleri</Text>
              <View style={styles.creatorMoreList}>
                {socialPosts
                  .filter((post) => post.authorId === socialPost.authorId && post.id !== socialPost.id)
                  .slice(0, 2)
                  .map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      onPress={() => navigation.navigate('RecipeDetail', { recipeId: post.recipeId, socialPostId: post.id })}
                      activeOpacity={0.86}
                      style={styles.creatorMoreItem}
                    >
                      <Text style={styles.creatorMoreItemTitle} numberOfLines={1}>{post.title}</Text>
                      <Text style={styles.creatorMoreItemMeta}>₺{post.marketBasketPrice} sepet • {post.totalTime} dk</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View style={[styles.stickyWrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.stickyBar}>
          <TouchableOpacity onPress={handlePrimaryRecipeAction} activeOpacity={0.88} style={styles.stickyPrimary}>
            <Ionicons
              name={marketBasketIngredients.length > 0 ? 'bag-add' : 'play-circle'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.stickyPrimaryText}>
              {marketBasketIngredients.length > 0
                ? `Eksikleri Sepete Ekle — ₺${marketTotal.toFixed(0)}`
                : 'Pişirme Moduna Geç'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setPurchaseMode('restaurant');
              showToast('Hazır yemek alternatifleri açıldı.', 'info');
            }}
            activeOpacity={0.84}
            style={styles.stickySecondary}
          >
            <Ionicons name="bicycle-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <BrandSelector
        visible={Boolean(brandSelectorItem)}
        ingredient={brandSelectorItem?.ingredient}
        brands={brandSelectorItem?.brands ?? []}
        selectedBrandId={brandSelectorItem?.selectedBrand.id}
        onSelect={(brand) => {
          if (brandSelectorItem) {
            handleBrandSelect(brandSelectorItem.ingredient.id, brand);
          }
        }}
        onClose={() => setBrandSelectorIngredientId(undefined)}
      />
      <CookingMode
        recipe={recipe}
        visible={cookingVisible}
        onClose={() => setCookingVisible(false)}
        onFinish={handleCookingFinished}
        onAskChef={() => {
          setCookingVisible(false);
          navigation.navigate('AiChefChat');
        }}
      />
      <VoiceKitchenMode recipe={recipe} visible={voiceVisible} onClose={() => setVoiceVisible(false)} />
      <TriedRecipeModal
        visible={triedVisible}
        recipeTitle={recipe.title}
        onClose={() => setTriedVisible(false)}
        onSubmit={handleTriedSubmit}
      />
      <ShareRecipeModal
        visible={shareVisible}
        title={recipe.title}
        onClose={() => setShareVisible(false)}
        onAction={(message) => showToast(message, 'info')}
      />
      {showTestingTools ? (
        <>
          <MiniSurveyModal
            surveyKey={`recipe-detail-${recipe.id}`}
            screenName="RecipeDetail"
            question="Bu tarif ekranı anlaşılır mıydı?"
            answers={['Evet', 'Kısmen', 'Hayır']}
            relatedEvent="recipe_opened"
            autoShow
            delayMs={1600}
          />
          <MiniSurveyModal
            surveyKey={`missing-items-${recipe.id}`}
            screenName="RecipeDetail"
            question="Eksik ürünleri sepete ekleme mantıklı mıydı?"
            answers={['Evet', 'Kısmen', 'Hayır']}
            relatedEvent="missing_items_added_to_cart"
            triggerCount={missingSurveyTrigger}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 138,
  },
  body: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: theme.screen.padding,
    paddingTop: 24,
  },
  commerceBlock: {
    marginTop: 14,
    gap: 12,
  },
  commerceLeadCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  commerceLeadIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commerceLeadCopy: {
    flex: 1,
  },
  commerceLeadTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  commerceLeadText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  commerceList: {
    gap: 10,
  },
  noMissingCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D7F4E5',
    backgroundColor: '#F2FFF7',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  noMissingCopy: {
    flex: 1,
  },
  noMissingTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  noMissingText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
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
  compatibilityLead: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: theme.colors.primary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
  },
  socialAuthorCard: {
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  socialAuthorMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialAuthorCopy: {
    flex: 1,
  },
  socialAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  socialAuthorName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  socialAuthorMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  socialStatsRow: {
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  socialStatText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
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
  quickButtonDisabled: {
    opacity: 0.65,
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
  socialCommentsBlock: {
    marginTop: 12,
    gap: 12,
  },
  creatorMoreCard: {
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 10,
  },
  creatorMoreTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  creatorMoreList: {
    gap: 8,
  },
  creatorMoreItem: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  creatorMoreItemTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  creatorMoreItemMeta: {
    marginTop: 4,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  stickyWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.screen.padding,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  stickyBar: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  stickyPrimary: {
    flex: 1,
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    ...theme.orangeShadow,
  },
  stickyPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  stickySecondary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    alignItems: 'center',
    justifyContent: 'center',
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
