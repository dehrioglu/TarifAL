import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

type DailyReturnCardProps = {
  streak: number;
  completedToday: boolean;
  onPress: () => void;
  compact?: boolean;
};

export function DailyReturnCard({
  streak,
  completedToday,
  onPress,
  compact,
}: DailyReturnCardProps) {
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.icon}>
        <Ionicons name={completedToday ? 'checkmark' : 'flame'} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{streak} günlük mutfak serisi</Text>
        <Text style={styles.title}>
          {completedToday ? 'Bugünkü ilhamını aldın' : 'Bugün bir tarif seç, serini devam ettir'}
        </Text>
        {!compact ? (
          <Text style={styles.text}>
            Sana özel önerileri inceleyerek dolabındaki ürünleri değerlendirebilirsin.
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={completedToday ? 'Yeni tarif keşfet' : 'Günün tarifini keşfet'}
        style={styles.button}
      >
        <Ionicons name="arrow-forward" size={17} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: theme.colors.text,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    ...theme.shadow,
    shadowOpacity: 0.06,
  },
  compactCard: {
    borderRadius: 20,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#FFB48B',
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  text: {
    marginTop: 4,
    color: '#D0D5DD',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
