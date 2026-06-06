import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

type MissingItem = {
  id: string;
  name: string;
  price: number;
};

type RecipePrimaryActionCardProps = {
  recipeTitle: string;
  matchPercent: number;
  matchedCount: number;
  missingItems: MissingItem[];
  marketTotal: number;
  prepTime: number;
  restaurantName?: string;
  restaurantPrice?: number;
  restaurantDelivery?: string;
  onPrimary: () => void;
  onOpenMarket: () => void;
  onOpenRestaurant: () => void;
  onStartCooking: () => void;
};

export function RecipePrimaryActionCard({
  recipeTitle,
  matchPercent,
  matchedCount,
  missingItems,
  marketTotal,
  prepTime,
  restaurantName,
  restaurantPrice,
  restaurantDelivery,
  onPrimary,
  onOpenMarket,
  onOpenRestaurant,
  onStartCooking,
}: RecipePrimaryActionCardProps) {
  const missingCount = missingItems.length;
  const hasMissing = missingCount > 0;
  const title = hasMissing ? 'Eksikleri tamamlayıp evde pişir' : 'Bu tarif evde hazır';
  const primaryText = hasMissing ? `Eksikleri Sepete Ekle — ₺${marketTotal.toFixed(0)}` : 'Pişirme Moduna Geç';
  const helper = hasMissing
    ? `${recipeTitle} için ${matchedCount} ürün evde var, ${missingCount} ürünü tamamlaman yeterli.`
    : `${recipeTitle} için market alışverişine gerek yok. Doğrudan pişirme moduna geçebilirsin.`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name={hasMissing ? 'basket-outline' : 'checkmark-circle-outline'} size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>TarifAL önerisi</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreValue}>%{matchPercent}</Text>
          <Text style={styles.scoreLabel}>uyum</Text>
        </View>
      </View>

      <Text style={styles.helper}>{helper}</Text>

      <View style={styles.statRow}>
        <MiniStat icon="home-outline" label="Evde var" value={`${matchedCount} ürün`} />
        <MiniStat icon="bag-add-outline" label="Eksik" value={hasMissing ? `${missingCount} ürün` : 'Yok'} />
        <MiniStat icon="time-outline" label="Süre" value={`${prepTime} dk`} />
      </View>

      {hasMissing ? (
        <View style={styles.missingBox}>
          <View style={styles.missingHeader}>
            <Text style={styles.missingTitle}>Tamamlanacak ürünler</Text>
            <TouchableOpacity onPress={onOpenMarket} activeOpacity={0.82}>
              <Text style={styles.linkText}>Markaları gör</Text>
            </TouchableOpacity>
          </View>
          {missingItems.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.missingRow}>
              <Text style={styles.missingName}>{item.name}</Text>
              <Text style={styles.missingPrice}>₺{item.price.toFixed(0)}</Text>
            </View>
          ))}
          {missingCount > 3 ? (
            <Text style={styles.moreText}>+{missingCount - 3} ürün daha</Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity onPress={onPrimary} activeOpacity={0.88} style={styles.primaryButton}>
        <Ionicons name={hasMissing ? 'bag-add' : 'play-circle'} size={18} color="#FFFFFF" />
        <Text style={styles.primaryText}>{primaryText}</Text>
      </TouchableOpacity>

      <View style={styles.secondaryRow}>
        <TouchableOpacity onPress={onStartCooking} activeOpacity={0.84} style={styles.secondaryButton}>
          <Ionicons name="restaurant-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.secondaryText}>Pişirme modu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenRestaurant} activeOpacity={0.84} style={styles.secondaryButton}>
          <Ionicons name="bicycle-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.secondaryText}>Hazır sipariş</Text>
        </TouchableOpacity>
      </View>

      {restaurantName && restaurantPrice ? (
        <TouchableOpacity onPress={onOpenRestaurant} activeOpacity={0.84} style={styles.readyHint}>
          <View style={styles.readyIcon}>
            <Ionicons name="storefront-outline" size={16} color={theme.colors.primary} />
          </View>
          <View style={styles.readyCopy}>
            <Text style={styles.readyTitle}>Hazır yemek alternatifi</Text>
            <Text style={styles.readyText}>
              {restaurantName} • ₺{restaurantPrice.toFixed(0)} • {restaurantDelivery ?? '30-45 dk'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={theme.colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function MiniStat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={theme.colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 16,
    gap: 13,
    ...theme.orangeShadow,
    shadowOpacity: 0.07,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },
  scorePill: {
    minWidth: 58,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 9,
    fontWeight: '900',
  },
  helper: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '800',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'center',
    gap: 3,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  missingBox: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  missingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  missingTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  missingRow: {
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  missingName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  missingPrice: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  moreText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 9,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  readyHint: {
    minHeight: 62,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyCopy: {
    flex: 1,
  },
  readyTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  readyText: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
});
