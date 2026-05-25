import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type BasketTab = 'market' | 'restaurant';

type DualBasketTabsProps = {
  active: BasketTab;
  marketCount: number;
  restaurantCount: number;
  onChange: (tab: BasketTab) => void;
};

export function DualBasketTabs({ active, marketCount, restaurantCount, onChange }: DualBasketTabsProps) {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        onPress={() => onChange('market')}
        activeOpacity={0.86}
        style={[styles.tab, active === 'market' && styles.tabActive]}
      >
        <Ionicons name="basket-outline" size={16} color={active === 'market' ? '#FFFFFF' : theme.colors.primary} />
        <Text style={[styles.tabText, active === 'market' && styles.tabTextActive]}>Market Sepeti</Text>
        <Text style={[styles.count, active === 'market' && styles.countActive]}>{marketCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('restaurant')}
        activeOpacity={0.86}
        style={[styles.tab, active === 'restaurant' && styles.tabActive]}
      >
        <Ionicons name="restaurant-outline" size={16} color={active === 'restaurant' ? '#FFFFFF' : theme.colors.primary} />
        <Text style={[styles.tabText, active === 'restaurant' && styles.tabTextActive]}>Restoran Sepeti</Text>
        <Text style={[styles.count, active === 'restaurant' && styles.countActive]}>{restaurantCount}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    padding: 5,
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    ...theme.orangeShadow,
    shadowOpacity: 0.11,
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  count: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: theme.colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '900',
  },
  countActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
  },
});
