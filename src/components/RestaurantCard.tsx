import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { RestaurantOption } from '../types';

type RestaurantCardProps = {
  restaurant: RestaurantOption;
  onAdd: () => void;
};

export function RestaurantCard({ restaurant, onAdd }: RestaurantCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.logo}>
          <Ionicons name="restaurant-outline" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
            {restaurant.sponsored ? <Text style={styles.sponsored}>Sponsorlu</Text> : null}
          </View>
          <Text style={styles.meta}>
            ⭐ {restaurant.rating.toFixed(1)} • {restaurant.deliveryEstimate} • Min. ₺{restaurant.minBasket}
          </Text>
        </View>
      </View>

      <View style={styles.tags}>
        {restaurant.tags.slice(0, 3).map((tag) => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.price}>₺{restaurant.portionPrice.toFixed(2)}</Text>
          <Text style={styles.fee}>Teslimat ₺{restaurant.deliveryFee.toFixed(0)}</Text>
        </View>
        <TouchableOpacity onPress={onAdd} activeOpacity={0.86} style={styles.button}>
          <Ionicons name="add-circle" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Sepete Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
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
    fontSize: 11,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tag: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    color: theme.colors.muted,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '900',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  price: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  fee: {
    marginTop: 3,
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '800',
  },
  button: {
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
