import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { RestaurantOption } from '../types';
import { RestaurantCard } from './RestaurantCard';

type RestaurantOrderOptionsProps = {
  restaurants: RestaurantOption[];
  onAddRestaurant: (restaurant: RestaurantOption) => void;
};

export function RestaurantOrderOptions({ restaurants, onAddRestaurant }: RestaurantOrderOptionsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Hazır yemek seçenekleri</Text>
        <Text style={styles.badge}>Restoran alternatifleri</Text>
      </View>
      <Text style={styles.subtitle}>
        Aynı yemeği sunan restoranları fiyat, puan ve teslimat süresine göre karşılaştır.
      </Text>
      <View style={styles.list}>
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onAdd={() => onAddRestaurant(restaurant)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  badge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
});
