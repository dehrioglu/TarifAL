import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/AppButton';
import { CategoryPill } from '../../components/CategoryPill';
import { FeedbackPromptButton } from '../../components/FeedbackPromptButton';
import { InputField } from '../../components/InputField';
import { MiniSurveyModal } from '../../components/MiniSurveyModal';
import { Screen } from '../../components/Screen';
import { recipeCategories } from '../../constants/categories';
import { theme } from '../../constants/theme';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { IMAGE_UPLOAD_DISABLED_MESSAGE, uploadRecipeImage } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import { Difficulty, Ingredient, RecipeCategory, RecipeStep } from '../../types';

const difficultyOptions: Difficulty[] = ['Kolay', 'Orta', 'Zor'];

const emptyIngredient = (): Ingredient => ({
  id: `ingredient-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: '',
  gram: 0,
  price: 0,
});

const emptyStep = (): RecipeStep => ({
  id: `step-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text: '',
});

export function AddRecipeScreen() {
  const navigation = useNavigation<any>();
  const user = useAppStore((store) => store.user);
  const accountMode = useAppStore((store) => store.accountMode);
  const addRecipe = useAppStore((store) => store.addRecipe);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [aiPrompt, setAiPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Kahvaltı');
  const [prepTime, setPrepTime] = useState('25');
  const [servings, setServings] = useState('2');
  const [calories, setCalories] = useState('320');
  const [difficulty, setDifficulty] = useState<Difficulty>('Kolay');
  const [tags, setTags] = useState('hızlı, ekonomik');
  const [marketReady, setMarketReady] = useState(true);
  const [restaurantReady, setRestaurantReady] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<RecipeStep[]>([emptyStep()]);
  const [submitting, setSubmitting] = useState(false);
  const [shareSurveyTrigger, setShareSurveyTrigger] = useState(0);
  const { showToast, showDemoModal, showComingSoon } = useFeedback();

  const canSubmit = useMemo(
    () =>
      title.trim().length > 2 &&
      description.trim().length > 4 &&
      Number(prepTime) > 0 &&
      Number(servings) > 0 &&
      ingredients.some((item) => item.name.trim() && item.gram > 0 && item.price > 0) &&
      steps.some((item) => item.text.trim()),
    [description, ingredients, prepTime, servings, steps, title],
  );
  const imagePreviewUri = useMemo(() => {
    const cleanUri = imageUri?.trim();
    return cleanUri && /^https?:\/\//i.test(cleanUri) ? cleanUri : undefined;
  }, [imageUri]);

  const pickImage = async () => {
    showToast(IMAGE_UPLOAD_DISABLED_MESSAGE, 'info');
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients((current) =>
      current.map((ingredient, itemIndex) => {
        if (itemIndex !== index) {
          return ingredient;
        }

        if (field === 'name' || field === 'id') {
          return { ...ingredient, [field]: value };
        }

        return { ...ingredient, [field]: Number(value.replace(',', '.')) || 0 };
      }),
    );
  };

  const updateStep = (index: number, value: string) => {
    setSteps((current) =>
      current.map((step, itemIndex) => (itemIndex === index ? { ...step, text: value } : step)),
    );
  };

  const resetForm = () => {
    setImageUri(undefined);
    setAiPrompt('');
    setTitle('');
    setDescription('');
    setCategory('Kahvaltı');
    setPrepTime('25');
    setServings('2');
    setCalories('320');
    setDifficulty('Kolay');
    setTags('hızlı, ekonomik');
    setMarketReady(true);
    setRestaurantReady(false);
    setIngredients([emptyIngredient()]);
    setSteps([emptyStep()]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast('Başlık, açıklama, en az bir malzeme ve bir hazırlık adımı eklemelisin.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const wasMarketReady = marketReady;
      const wasRestaurantReady = restaurantReady;
      const uploadedImage = imageUri
        ? await uploadRecipeImage(imageUri, user?.id ?? 'demo-user', accountMode === 'demo')
        : undefined;
      const recipe = await addRecipe({
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl: uploadedImage,
        prepTime: Number(prepTime) || 25,
        servings: Number(servings) || 2,
        calories: Number(calories) || 0,
        difficulty,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        socialMarketReady: wasMarketReady,
        socialRestaurantReady: wasRestaurantReady,
        ingredients: ingredients
          .filter((item) => item.name.trim() && item.gram > 0 && item.price > 0)
          .map((item) => ({ ...item, name: item.name.trim() })),
        steps: steps
          .filter((item) => item.text.trim())
          .map((item) => ({ ...item, text: item.text.trim() })),
      });

      resetForm();
      setShareSurveyTrigger((value) => value + 1);
      showDemoModal({
        title: 'Tarif paylaşıldı',
        message: `${recipe.title} topluluk akışına eklendi. ${wasMarketReady ? 'Market sepetine uygun' : 'Evde yap'} ${wasRestaurantReady ? 've hazır yemek siparişine uygun' : ''} olarak ${accountMode === 'account' ? 'hesabına kaydedildi' : 'bu oturumda saklandı'}.`,
        primaryLabel: 'Keşfet Akışına Git',
        secondaryLabel: 'Ana Sayfa',
        onPrimary: () => navigation.navigate('Explore'),
        onSecondary: () => navigation.navigate('Home'),
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Paylaşım tamamlanamadı, tekrar deneyin.', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const showPlaceholder = (type: 'image' | 'video') => {
    showComingSoon(
      type === 'image'
        ? 'AI görsel üretimi beta sürecinden sonra aktif edilecek. Şimdilik görsel alanı yer tutucu olarak hazırlanır.'
        : 'AI video üretimi beta sürecinden sonra aktif edilecek. Şimdilik video alanı yer tutucu olarak hazırlanır.',
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.title}>Tarif Paylaş</Text>
      <Text style={styles.subtitle}>Yemeğini topluluğa, sepete ve sipariş akışına hazırla</Text>
      <View style={styles.feedbackWrap}>
        <FeedbackPromptButton screenName="AddRecipe" compact />
      </View>

      <TouchableOpacity activeOpacity={0.86} onPress={pickImage} style={styles.uploadBox}>
        {imagePreviewUri ? (
          <Image source={{ uri: imagePreviewUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.uploadContent}>
            <Ionicons name="image-outline" size={45} color={theme.colors.primary} />
            <Text style={styles.uploadText}>Tarifin için görsel ekle</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity activeOpacity={0.86} onPress={pickImage} style={styles.softButton}>
          <Ionicons name="link-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.softButtonText}>URL Kullan</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={() => showPlaceholder('image')} style={styles.softButton}>
          <Ionicons name="sparkles-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.softButtonText}>AI Görsel</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={() => showPlaceholder('video')} style={styles.softButton}>
          <Ionicons name="videocam-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.softButtonText}>AI Video</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Görsel bağlantısı</Text>
        <InputField
          value={imageUri ?? ''}
          onChangeText={(value) => setImageUri(value.trim() || undefined)}
          placeholder="https://.../tarif-gorseli.jpg"
        />
        <Text style={styles.helperText}>
          Firebase Storage bu sürümde kapalı. Bağlantı ekleyebilir veya varsayılan görselle devam edebilirsin.
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>AI üretimi için ipucu</Text>
        <InputField
          value={aiPrompt}
          onChangeText={setAiPrompt}
          placeholder={'Örn: "Közde Adana kebap, lavaş ve sumakla"'}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Tarif Başlığı</Text>
        <InputField value={title} onChangeText={setTitle} placeholder="Örn: Klasik Mercimek Çorbası" />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Bu tarifin hikayesi..."
          placeholderTextColor={theme.colors.subtle}
          multiline
          style={styles.textArea}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.categoryRow}>
          {recipeCategories.map((item) => (
            <CategoryPill
              key={item}
              category={item}
              active={category === item}
              onPress={() => setCategory(item)}
              style={styles.categoryPill}
            />
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Tarif Bilgileri</Text>
        <View style={styles.infoRow}>
          <InputField value={prepTime} onChangeText={setPrepTime} placeholder="dk" keyboardType="numeric" containerStyle={styles.infoInput} />
          <InputField value={servings} onChangeText={setServings} placeholder="porsiyon" keyboardType="numeric" containerStyle={styles.infoInput} />
          <InputField value={calories} onChangeText={setCalories} placeholder="kalori" keyboardType="numeric" containerStyle={styles.infoInput} />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Zorluk</Text>
        <View style={styles.categoryRow}>
          {difficultyOptions.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setDifficulty(item)}
              activeOpacity={0.86}
              style={[styles.difficultyChip, difficulty === item && styles.difficultyChipActive]}
            >
              <Text style={[styles.difficultyText, difficulty === item && styles.difficultyTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Etiketler</Text>
        <InputField value={tags} onChangeText={setTags} placeholder="hızlı, fit, ekonomik" />
      </View>

      <View style={styles.socialCommerceCard}>
        <View style={styles.socialCommerceHeader}>
          <View style={styles.socialCommerceCopy}>
            <Text style={styles.socialCommerceTitle}>Sosyal + ticari uygunluk</Text>
            <Text style={styles.socialCommerceText}>
              Tarif paylaşıldığında market sepeti veya hazır yemek aksiyonlarıyla görünsün.
            </Text>
          </View>
          <View style={styles.socialCommerceIcon}>
            <Ionicons name="sparkles" size={18} color={theme.colors.primary} />
          </View>
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Market sepetine uygun</Text>
            <Text style={styles.switchText}>Malzemeleri sepete dönüştür.</Text>
          </View>
          <Switch
            value={marketReady}
            onValueChange={setMarketReady}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Hazır yemek siparişine uygun</Text>
            <Text style={styles.switchText}>Restoran seçeneği uygunluğunu işaretle.</Text>
          </View>
          <Switch
            value={restaurantReady}
            onValueChange={setRestaurantReady}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.sectionLine}>
        <Text style={styles.sectionTitle}>Malzemeler (gr ve fiyat)</Text>
        <TouchableOpacity onPress={() => setIngredients((current) => [...current, emptyIngredient()])} style={styles.addMini}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.ingredientList}>
        {ingredients.map((ingredient, index) => (
          <View key={ingredient.id} style={styles.ingredientRow}>
            <InputField
              value={ingredient.name}
              onChangeText={(value) => updateIngredient(index, 'name', value)}
              placeholder="Malzeme"
              containerStyle={styles.ingredientName}
            />
            <InputField
              value={ingredient.gram ? String(ingredient.gram) : ''}
              onChangeText={(value) => updateIngredient(index, 'gram', value)}
              placeholder="gr"
              keyboardType="numeric"
              containerStyle={styles.numberInput}
            />
            <InputField
              value={ingredient.price ? String(ingredient.price) : ''}
              onChangeText={(value) => updateIngredient(index, 'price', value)}
              placeholder="₺"
              keyboardType="numeric"
              containerStyle={styles.numberInput}
            />
          </View>
        ))}
      </View>

      <View style={styles.sectionLine}>
        <Text style={styles.sectionTitle}>Hazırlanış Adımları</Text>
        <TouchableOpacity onPress={() => setSteps((current) => [...current, emptyStep()])} style={styles.addMini}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.stepList}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <InputField
              value={step.text}
              onChangeText={(value) => updateStep(index, value)}
              placeholder={`Adım ${index + 1}`}
              containerStyle={styles.stepInput}
            />
          </View>
        ))}
      </View>

      <AppButton
        title="Tarifi Paylaş"
        icon="checkmark-circle"
        onPress={handleSubmit}
        loading={submitting}
        disabled={!canSubmit}
        style={styles.submit}
      />
      {!canSubmit ? (
        <Text style={styles.disabledHint}>
          Paylaşmak için başlık, açıklama, en az bir malzeme ve bir hazırlık adımı eklemelisin.
        </Text>
      ) : null}
      <MiniSurveyModal
        surveyKey="recipe-share-completed"
        screenName="AddRecipe"
        question="Tarif paylaşma süreci kolay mıydı?"
        answers={['Evet', 'Kısmen', 'Hayır']}
        relatedEvent="recipe_shared"
        triggerCount={shareSurveyTrigger}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackWrap: {
    marginTop: 14,
  },
  uploadBox: {
    height: 178,
    marginTop: 24,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadContent: {
    alignItems: 'center',
    gap: 10,
  },
  uploadText: {
    color: theme.colors.muted,
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  softButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  softButtonText: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 12,
  },
  fieldGroup: {
    marginTop: 22,
    gap: 9,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 74,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    textAlignVertical: 'top',
    fontSize: 15,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    minWidth: 86,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoInput: {
    flex: 1,
  },
  difficultyChip: {
    minHeight: 42,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  difficultyText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  difficultyTextActive: {
    color: '#FFFFFF',
  },
  socialCommerceCard: {
    marginTop: 22,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 12,
  },
  socialCommerceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialCommerceCopy: {
    flex: 1,
  },
  socialCommerceTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  socialCommerceText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  socialCommerceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchCopy: {
    flex: 1,
  },
  switchTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  switchText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionLine: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  addMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientList: {
    marginTop: 12,
    gap: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ingredientName: {
    flex: 1,
  },
  numberInput: {
    width: 74,
  },
  stepList: {
    marginTop: 12,
    gap: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  stepInput: {
    flex: 1,
  },
  submit: {
    marginTop: 36,
    marginBottom: 6,
  },
  disabledHint: {
    marginBottom: 10,
    color: theme.colors.subtle,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
