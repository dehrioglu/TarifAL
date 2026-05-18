import { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/AppButton';
import { CategoryPill } from '../../components/CategoryPill';
import { InputField } from '../../components/InputField';
import { Screen } from '../../components/Screen';
import { recipeCategories } from '../../constants/categories';
import { theme } from '../../constants/theme';
import { uploadRecipeImage } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import { Ingredient, RecipeCategory, RecipeStep } from '../../types';

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
  const addRecipe = useAppStore((store) => store.addRecipe);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [aiPrompt, setAiPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Kahvaltı');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<RecipeStep[]>([emptyStep()]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      title.trim().length > 2 &&
      description.trim().length > 4 &&
      ingredients.some((item) => item.name.trim() && item.gram > 0 && item.price > 0) &&
      steps.some((item) => item.text.trim()),
    [description, ingredients, steps, title],
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Galeriye erişim izni olmadan görsel seçilemez.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
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
    setIngredients([emptyIngredient()]);
    setSteps([emptyStep()]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Eksik bilgi', 'Başlık, açıklama, en az bir malzeme ve bir adım ekle.');
      return;
    }

    setSubmitting(true);

    try {
      const uploadedImage = imageUri ? await uploadRecipeImage(imageUri, user?.id ?? 'demo-user') : undefined;
      const recipe = addRecipe({
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl: uploadedImage,
        ingredients: ingredients
          .filter((item) => item.name.trim() && item.gram > 0 && item.price > 0)
          .map((item) => ({ ...item, name: item.name.trim() })),
        steps: steps
          .filter((item) => item.text.trim())
          .map((item) => ({ ...item, text: item.text.trim() })),
      });

      resetForm();
      Alert.alert('Tarif paylaşıldı', `${recipe.title} topluluğa eklendi.`);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Paylaşım tamamlanamadı', error instanceof Error ? error.message : 'Tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const showPlaceholder = (type: 'image' | 'video') => {
    Alert.alert(
      type === 'image' ? 'AI Görsel' : 'AI Video',
      'Bu buton hazır bir placeholder. Gerçek üretim servisi bağlandığında burada çıktı oluşturulacak.',
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.title}>Tarif Ekle</Text>
      <Text style={styles.subtitle}>Yemeğini topluluğa tanıt</Text>

      <TouchableOpacity activeOpacity={0.86} onPress={pickImage} style={styles.uploadBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.uploadContent}>
            <Ionicons name="image-outline" size={45} color={theme.colors.primary} />
            <Text style={styles.uploadText}>Tarifin için görsel ekle</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity activeOpacity={0.86} onPress={pickImage} style={styles.softButton}>
          <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.softButtonText}>Galeriden</Text>
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
    marginBottom: 10,
  },
});
