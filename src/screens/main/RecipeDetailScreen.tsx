import { Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IngredientCard } from '../../components/IngredientCard';
import { theme } from '../../constants/theme';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export function RecipeDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const recipe = useAppStore((store) =>
    store.recipes.find((item) => item.id === route.params.recipeId),
  );
  const likes = useAppStore((store) => store.likes);
  const toggleLike = useAppStore((store) => store.toggleLike);
  const addIngredientToCart = useAppStore((store) => store.addIngredientToCart);
  const addRecipeToCart = useAppStore((store) => store.addRecipeToCart);

  if (!recipe) {
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

  const handleAddIngredient = (ingredientId: string) => {
    const ingredient = recipe.ingredients.find((item) => item.id === ingredientId);

    if (!ingredient) {
      return;
    }

    addIngredientToCart(recipe, ingredient);
    Alert.alert('Sepete eklendi', `${ingredient.name} sepetine eklendi.`);
  };

  const handleAddAll = () => {
    addRecipeToCart(recipe.id);
    Alert.alert('Sepete eklendi', `${recipe.title} için tüm malzemeler sepete eklendi.`);
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
                onOrder={() => handleAddIngredient(ingredient.id)}
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
