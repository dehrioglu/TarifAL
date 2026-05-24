import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { smartBasketQuickIngredients } from '../data/demoSmartBasket';
import { theme } from '../constants/theme';
import { useFeedback } from '../feedback/FeedbackProvider';
import { normalizeIngredientText } from '../utils/recipeMatching';

type SmartBasketIngredientStepProps = {
  selectedIngredients: string[];
  onChange: (ingredients: string[]) => void;
  onNext: () => void;
};

export function SmartBasketIngredientStep({
  selectedIngredients,
  onChange,
  onNext,
}: SmartBasketIngredientStepProps) {
  const [value, setValue] = useState('');
  const { showToast } = useFeedback();

  const update = (items: string[]) => {
    onChange([...new Set(items.map((item) => item.trim()).filter(Boolean))]);
  };

  const addIngredient = (ingredient: string) => {
    const exists = selectedIngredients.some(
      (item) => normalizeIngredientText(item) === normalizeIngredientText(ingredient),
    );

    if (!exists) {
      update([...selectedIngredients, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    update(
      selectedIngredients.filter(
        (item) => normalizeIngredientText(item) !== normalizeIngredientText(ingredient),
      ),
    );
  };

  const handleAddText = () => {
    if (!value.trim()) {
      showToast('Eklemek için malzeme adı yaz.', 'warning');
      return;
    }

    addIngredient(value);
    setValue('');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Evde hangi malzemeler var?</Text>
          <Text style={styles.subtitle}>TarifAL bu listeyle tarif uyumunu ve eksik ürünleri hesaplayacak.</Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="basket-outline" size={22} color={theme.colors.primary} />
        </View>
      </View>

      <View style={styles.quickGrid}>
        {smartBasketQuickIngredients.map((ingredient) => {
          const active = selectedIngredients.some(
            (item) => normalizeIngredientText(item) === normalizeIngredientText(ingredient),
          );

          return (
            <TouchableOpacity
              key={ingredient}
              onPress={() => (active ? removeIngredient(ingredient) : addIngredient(ingredient))}
              activeOpacity={0.86}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>{ingredient}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleAddText}
          placeholder="Örn: yumurta, makarna, tavuk..."
          placeholderTextColor={theme.colors.subtle}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleAddText}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Malzeme ekle"
          style={styles.addButton}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {selectedIngredients.length > 0 ? (
        <View style={styles.selectedWrap}>
          {selectedIngredients.map((ingredient) => (
            <TouchableOpacity
              key={ingredient}
              onPress={() => removeIngredient(ingredient)}
              activeOpacity={0.85}
              style={styles.selectedChip}
            >
              <Text style={styles.selectedText}>{ingredient}</Text>
              <Ionicons name="close" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Başlamak için en az bir malzeme seç.</Text>
      )}

      <TouchableOpacity
        onPress={onNext}
        activeOpacity={0.88}
        disabled={selectedIngredients.length === 0}
        accessibilityRole="button"
        accessibilityLabel="Bu malzemelerle devam et"
        style={[styles.primaryButton, selectedIngredients.length === 0 && styles.disabledButton]}
      >
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.primaryText}>Bu malzemelerle devam et</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 14,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeChipText: {
    color: '#FFFFFF',
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
    backgroundColor: theme.colors.surface,
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
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    minHeight: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryButton: {
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
  disabledButton: {
    opacity: 0.5,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
