import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { IngredientBrandOption } from '../types';

type BrandOptionCardProps = {
  brand: IngredientBrandOption;
  selected: boolean;
  onPress: () => void;
};

const qualityLabel: Record<IngredientBrandOption['quality'], string> = {
  economic: 'Ekonomik',
  standard: 'Standart',
  premium: 'Premium',
};

export function BrandOptionCard({ brand, selected, onPress }: BrandOptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={`${brand.name} seç`}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{brand.name}</Text>
            {brand.sponsored ? <Text style={styles.sponsored}>Sponsorlu</Text> : null}
          </View>
          <Text style={styles.meta}>
            {brand.size} • {qualityLabel[brand.quality]}
          </Text>
        </View>
        <View style={styles.priceWrap}>
          <Text style={styles.price}>₺{brand.price.toFixed(2)}</Text>
          <Ionicons
            name={selected ? 'checkmark-circle' : 'ellipse-outline'}
            size={21}
            color={selected ? theme.colors.primary : theme.colors.subtle}
          />
        </View>
      </View>
      {brand.campaign ? (
        <View style={styles.campaignPill}>
          <Ionicons name="pricetag-outline" size={12} color={theme.colors.primary} />
          <Text style={styles.campaignText}>{brand.campaign}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    gap: 10,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFF8F4',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  sponsored: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
  },
  meta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  priceWrap: {
    alignItems: 'flex-end',
    gap: 7,
  },
  price: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  campaignPill: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  campaignText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});
