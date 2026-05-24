import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type InvestorDemoStartCardProps = {
  onPress: () => void;
};

export function InvestorDemoStartCard({ onPress }: InvestorDemoStartCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="Yatırımcı demosunu başlat"
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="play" size={16} color="#FFFFFF" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Sunum akışı</Text>
        <Text style={styles.title}>Yatırımcı Demosunu Başlat</Text>
        <Text style={styles.text} numberOfLines={2}>
          AI tarif önerisinden akıllı sepete, demo siparişten pişirme moduna tek akış.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    minHeight: 92,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF9F5',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.orangeShadow,
    shadowOpacity: 0.16,
  },
  copy: {
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
    fontSize: 17,
    fontWeight: '900',
  },
  text: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
});
