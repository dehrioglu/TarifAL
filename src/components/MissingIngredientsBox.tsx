import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Ingredient } from '../types';

type MissingIngredientsBoxProps = {
  ingredients: Ingredient[];
  onAddMissing: () => void;
};

export function MissingIngredientsBox({ ingredients, onAddMissing }: MissingIngredientsBoxProps) {
  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Eksik Malzemeler</Text>
          <Text style={styles.subtitle}>
            {ingredients.length === 0 ? 'Bu tarif için her şey hazır.' : `${ingredients.length} ürün eksik görünüyor.`}
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
        </View>
      </View>

      {ingredients.length > 0 ? (
        <View style={styles.list}>
          {ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.row}>
              <Text style={styles.name}>{ingredient.name}</Text>
              <Text style={styles.price}>₺{ingredient.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onAddMissing}
        disabled={ingredients.length === 0}
        activeOpacity={0.85}
        style={[styles.button, ingredients.length === 0 && styles.disabledButton]}
      >
        <Ionicons name="bag-add" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Eksikleri Sepete Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 24,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 8,
  },
  row: {
    minHeight: 38,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  price: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  button: {
    minHeight: 46,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
