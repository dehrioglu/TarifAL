import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { CartItem } from '../types';

type CartItemCardProps = {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export function CartItemCard({ item, onIncrement, onDecrement, onRemove }: CartItemCardProps) {
  const normalizedName = item.name.toLocaleLowerCase('tr-TR');
  const fallbackUnit =
    item.source === 'familyList'
      ? normalizedName.includes('süt')
        ? 'lt'
        : normalizedName.includes('yumurta')
          ? 'koli'
          : normalizedName.includes('yoğurt')
            ? 'kg'
            : normalizedName.includes('tavuk')
              ? 'gr'
              : 'adet'
      : 'gr';
  const amountText = `${item.gram} ${item.unit ?? fallbackUnit}`;

  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        {item.source === 'smartBasket' || item.source === 'familyList' ? (
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>
              {item.source === 'familyList' ? 'Ev Listesi\'nden aktarıldı' : 'Akıllı Sepet\'ten aktarıldı'}
            </Text>
          </View>
        ) : null}
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.recipe}>Tarif: {item.recipeTitle}</Text>
        <Text style={styles.meta}>
          {amountText} • ₺{item.price.toFixed(2)} / adet
        </Text>
      </View>
      <View style={styles.qtyRow}>
        <TouchableOpacity onPress={onDecrement} style={styles.qtyButton} activeOpacity={0.8}>
          <Ionicons name="remove" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity onPress={onIncrement} style={styles.qtyButton} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} style={styles.deleteButton} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={19} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 82,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 2,
  },
  sourceBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  recipe: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 16,
    textAlign: 'center',
    color: theme.colors.text,
    fontWeight: '900',
  },
  deleteButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
