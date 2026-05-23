import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { demoWasteIngredients } from '../data/demoPremium';
import { theme } from '../constants/theme';

type WasteReductionCardProps = {
  onUseWasteMode: () => void;
};

export function WasteReductionCard({ onUseWasteMode }: WasteReductionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>İsrafı Azalt</Text>
          <Text style={styles.subtitle}>
            Son kullanma tarihi yaklaşan ürünleri ekle, TarifAL onları değerlendirebileceğin tarifleri önersin.
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons name="leaf-outline" size={22} color="#16A34A" />
        </View>
      </View>

      <View style={styles.list}>
        {demoWasteIngredients.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>{item.daysLeft}g</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.suggestion} numberOfLines={2}>{item.suggestion}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={onUseWasteMode} activeOpacity={0.86} style={styles.button}>
        <Ionicons name="sparkles" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Bu ürünlerle tarif bul</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#D9FBE8',
    backgroundColor: '#F3FFF8',
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 8,
  },
  row: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  suggestion: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  button: {
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
