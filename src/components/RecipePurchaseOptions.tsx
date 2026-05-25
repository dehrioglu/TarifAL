import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { PurchaseMode } from '../types';

type Option = {
  id: PurchaseMode;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const options: Option[] = [
  {
    id: 'home',
    title: 'Evde Yap',
    description: 'Evindeki malzemelerle tarifi uygula.',
    icon: 'home-outline',
  },
  {
    id: 'market',
    title: 'Malzemeleri Al',
    description: 'Eksikleri market sepetine ekle.',
    icon: 'basket-outline',
  },
  {
    id: 'restaurant',
    title: 'Hazır Sipariş Et',
    description: 'Bu yemeği restoranlardan söyle.',
    icon: 'restaurant-outline',
  },
];

type RecipePurchaseOptionsProps = {
  value: PurchaseMode;
  onChange: (value: PurchaseMode) => void;
};

export function RecipePurchaseOptions({ value, onChange }: RecipePurchaseOptionsProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bu tarifi nasıl almak istersin?</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const active = option.id === value;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onChange(option.id)}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel={option.title}
              style={[styles.option, active && styles.optionActive]}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Ionicons name={option.icon} size={18} color={active ? '#FFFFFF' : theme.colors.primary} />
              </View>
              <Text style={[styles.optionTitle, active && styles.optionTitleActive]} numberOfLines={1}>
                {option.title}
              </Text>
              <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={2}>
                {option.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 14,
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    minHeight: 118,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  optionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    ...theme.orangeShadow,
    shadowOpacity: 0.1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  optionTitle: {
    marginTop: 9,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  optionTitleActive: {
    color: '#FFFFFF',
  },
  optionText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  optionTextActive: {
    color: 'rgba(255,255,255,0.86)',
  },
});
