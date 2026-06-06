import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { SponsoredProduct } from '../types';

type SponsoredProductCardProps = {
  product: SponsoredProduct;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  onAddToCart: () => void;
  onViewAlternatives?: () => void;
};

export function SponsoredProductCard({
  product,
  title = 'Bu ihtiyaca uygun marka önerisi',
  subtitle,
  compact = false,
  onAddToCart,
  onViewAlternatives,
}: SponsoredProductCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.productMark}>
          <Text style={styles.productMarkText}>{product.imageURL ?? product.brandName.charAt(0)}</Text>
        </View>
        <View style={styles.headerCopy}>
          <View style={styles.labelRow}>
            <Text style={styles.kicker}>{product.sponsorLabel}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.productRow}>
        <View style={styles.productCopy}>
          <Text style={styles.brand}>{product.brandName}</Text>
          <Text style={styles.name}>{product.productName}</Text>
          <Text style={styles.reason}>{product.reason}</Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.price}>₺{product.price.toFixed(2)}</Text>
          <Text style={styles.unit}>{product.unit}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onViewAlternatives ? (
          <TouchableOpacity
            onPress={onViewAlternatives}
            activeOpacity={0.84}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel={`${product.productName} için alternatif markaları gör`}
          >
            <Ionicons name="git-compare-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.secondaryText}>Alternatifleri gör</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={onAddToCart}
          activeOpacity={0.86}
          style={[styles.primaryButton, !onViewAlternatives && styles.primaryButtonWide]}
          accessibilityRole="button"
          accessibilityLabel={`${product.productName} sepete ekle`}
        >
          <Ionicons name="basket-outline" size={15} color="#FFFFFF" />
          <Text style={styles.primaryText}>Sepete Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 13,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  cardCompact: {
    borderRadius: 20,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  productMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productMarkText: {
    fontSize: 21,
  },
  headerCopy: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  productCopy: {
    flex: 1,
  },
  brand: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  name: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  reason: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  priceBox: {
    minWidth: 78,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 9,
    alignItems: 'center',
  },
  price: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  unit: {
    marginTop: 3,
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButtonWide: {
    flex: 1,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
