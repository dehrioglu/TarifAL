import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RecipeCard } from '../../components/RecipeCard';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { enhancedSocialCollections } from '../../data/mockCollections';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CollectionDetail'>;

export function CollectionDetailScreen({ navigation, route }: Props) {
  const recipes = useAppStore((store) => store.recipes);
  const likes = useAppStore((store) => store.likes);
  const collectionSaves = useAppStore((store) => store.collectionSaves);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const toggleCollectionSave = useAppStore((store) => store.toggleCollectionSave);
  const addMissingIngredientsToCart = useAppStore((store) => store.addMissingIngredientsToCart);
  const { showToast, showDemoModal } = useFeedback();
  const collection =
    enhancedSocialCollections.find((item) => item.id === route.params.collectionId) ??
    enhancedSocialCollections[0];
  const collectionRecipes = recipes.filter((recipe) => collection.recipeIds.includes(recipe.id));
  const saved = Boolean(collectionSaves[collection.id]);

  const addCollectionToCart = () => {
    collectionRecipes.forEach((recipe) => addMissingIngredientsToCart(recipe.id));
    showDemoModal({
      title: 'Koleksiyon TarifAL Sepet’e aktarıldı',
      message: `${collection.title} koleksiyonundaki ${collectionRecipes.length} tarifin eksikleri demo market sepetine eklendi.`,
      primaryLabel: 'Sepete Git',
      secondaryLabel: 'Koleksiyonda Kal',
      onPrimary: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
    });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <ImageBackground
        source={{ uri: collection.coverImageUrl }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.overlay} />
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.86} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Koleksiyon</Text>
          <Text style={styles.title}>{collection.title}</Text>
          <Text style={styles.subtitle}>{collection.description}</Text>
        </View>
      </ImageBackground>

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryValue}>{collectionRecipes.length}</Text>
          <Text style={styles.summaryLabel}>Tarif</Text>
        </View>
        <View>
          <Text style={styles.summaryValue}>{((collection.saves ?? 0) + (saved ? 1 : 0)).toLocaleString('tr-TR')}</Text>
          <Text style={styles.summaryLabel}>Kaydetme</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            toggleCollectionSave(collection.id);
            showToast(saved ? 'Koleksiyon kayıttan çıkarıldı.' : 'Koleksiyon kaydedildi.');
          }}
          activeOpacity={0.86}
          style={[styles.saveButton, saved && styles.savedButton]}
        >
          <Text style={[styles.saveText, saved && styles.savedText]}>{saved ? 'Kaydedildi' : 'Koleksiyonu Kaydet'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Koleksiyondaki Tarifler</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeRow}>
        {collectionRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            liked={Boolean(likes[recipe.id])}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
            onToggleLike={() => toggleLike(recipe.id)}
            variant="mini"
          />
        ))}
      </ScrollView>

      <View style={styles.commercialCard}>
        <View style={styles.commercialIcon}>
          <Ionicons name="basket-outline" size={21} color={theme.colors.primary} />
        </View>
        <View style={styles.commercialCopy}>
          <Text style={styles.commercialTitle}>Bu koleksiyonu sofraya dönüştür</Text>
          <Text style={styles.commercialText}>
            Eksik malzemeleri birleştirerek TarifAL Sepet’e aktar.
          </Text>
        </View>
        <TouchableOpacity
          onPress={addCollectionToCart}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel="Koleksiyon eksiklerini sepete ekle"
          style={styles.cartButton}
        >
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 12,
  },
  hero: {
    minHeight: 260,
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  heroImage: {
    borderRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.34)',
  },
  backButton: {
    margin: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    padding: 18,
  },
  eyebrow: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    color: '#F2F4F7',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  summary: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  saveButton: {
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  savedButton: {
    backgroundColor: theme.colors.primarySoft,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  savedText: {
    color: theme.colors.primary,
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  recipeRow: {
    gap: 12,
  },
  commercialCard: {
    marginTop: 20,
    minHeight: 82,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commercialIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commercialCopy: {
    flex: 1,
  },
  commercialTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  commercialText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
