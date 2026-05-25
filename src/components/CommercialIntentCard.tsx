import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type CommercialIntentCardProps = {
  onOpenPantry: () => void;
  onOpenSmartBasket: () => void;
  onOpenRestaurant: () => void;
};

export function CommercialIntentCard({
  onOpenPantry,
  onOpenSmartBasket,
  onOpenRestaurant,
}: CommercialIntentCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bugün ne yapmak istersin?</Text>
      <Text style={styles.subtitle}>Tariften markete veya hazır yemeğe giden ticari akışları hızlıca dene.</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onOpenPantry} activeOpacity={0.86} style={styles.action}>
          <Ionicons name="home-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.actionText}>Evde Ne Var?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenSmartBasket} activeOpacity={0.86} style={[styles.action, styles.primaryAction]}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <Text style={styles.primaryText}>Akıllı Sepet</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenRestaurant} activeOpacity={0.86} style={styles.action}>
          <Ionicons name="restaurant-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.actionText}>Hazır Yemek</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
    ...theme.orangeShadow,
    shadowOpacity: 0.1,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
