import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Ingredient, IngredientBrandOption } from '../types';

type IngredientImageItemProps = {
  ingredient: Ingredient;
  brand: IngredientBrandOption;
  onPress: () => void;
};

export function IngredientImageItem({ ingredient, brand, onPress }: IngredientImageItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.86} style={styles.card}>
      <View style={styles.imageWrap}>
        <Text style={styles.image}>{ingredient.image ?? '🛒'}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>{ingredient.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {ingredient.gram} {ingredient.defaultUnit ?? 'gr'} • {brand.name}
        </Text>
        {brand.campaign ? <Text style={styles.campaign}>{brand.campaign}</Text> : null}
      </View>
      <View style={styles.priceWrap}>
        <Text style={styles.price}>₺{brand.price.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  imageWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    fontSize: 22,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  meta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  campaign: {
    marginTop: 4,
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  priceWrap: {
    alignItems: 'flex-end',
    gap: 5,
  },
  price: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
});
