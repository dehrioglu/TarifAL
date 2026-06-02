import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { Ingredient } from '../../types';

type MissingItemsCartCardProps = {
  ingredients: Ingredient[];
  total: number;
  onAdd: () => void;
};

export function MissingItemsCartCard({ ingredients, total, onAdd }: MissingItemsCartCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="basket-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Eksikleri TarifAL Sepet’e ekle</Text>
          <Text style={styles.subtitle}>
            {ingredients.length === 0
              ? 'Bu tarif için market alışverişine ihtiyacın yok.'
              : `${ingredients.length} eksik ürün tek dokunuşla market sepetine aktarılsın.`}
          </Text>
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
        onPress={onAdd}
        activeOpacity={0.84}
        disabled={ingredients.length === 0}
        accessibilityRole="button"
        accessibilityLabel="Eksikleri TarifAL Sepet'e ekle"
        style={[styles.button, ingredients.length === 0 && styles.buttonDisabled]}
      >
        <Ionicons name="bag-add-outline" size={17} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          {ingredients.length === 0 ? 'Dolabın Hazır' : `Eksikleri Sepete Ekle — ₺${total.toFixed(0)}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    padding: 15,
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  list: {
    gap: 7,
  },
  row: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  price: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  button: {
    minHeight: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    ...theme.orangeShadow,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
