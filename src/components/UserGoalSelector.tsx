import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { UserGoal } from '../types';

const goals: UserGoal[] = [
  'Kilo vermek',
  'Kas yapmak',
  'Sağlıklı beslenmek',
  'Ekonomik beslenmek',
  'Pratik yemek yapmak',
  'Aile için pratik yemek',
  'Öğrenci modu',
  'Zaman kazanmak',
];

const goalDetails: Record<UserGoal, { title: string; text: string; metric: string; icon: keyof typeof Ionicons.glyphMap }> = {
  'Kilo vermek': {
    title: 'Hafif tabaklar öne çıkar',
    text: 'Düşük kalorili, sebze ağırlıklı ve porsiyon kontrollü tarifler daha görünür olur.',
    metric: '5 hafif öneri',
    icon: 'leaf-outline',
  },
  'Kas yapmak': {
    title: 'Protein dengesi güçlenir',
    text: 'Tavuk, yumurta, bakliyat ve protein odaklı tarifler öneri sıralamasında yükselir.',
    metric: '4 proteinli tarif',
    icon: 'barbell-outline',
  },
  'Sağlıklı beslenmek': {
    title: 'Dengeli öğünler seçilir',
    text: 'Fit tabaklar, salatalar ve daha dengeli malzeme listeleri öne alınır.',
    metric: '6 dengeli seçim',
    icon: 'heart-outline',
  },
  'Ekonomik beslenmek': {
    title: 'Akıllı bütçe devrede',
    text: 'İsrafı azaltan, fiyatı kontrollü ve sepete uygun tarifler öncelik kazanır.',
    metric: '7 bütçe önerisi',
    icon: 'wallet-outline',
  },
  'Pratik yemek yapmak': {
    title: 'Zaman kazandıran tarifler',
    text: '30 dakika altı, az adımlı ve hızlı hazırlanabilen öneriler öne çıkar.',
    metric: '8 pratik tarif',
    icon: 'timer-outline',
  },
  'Aile için pratik yemek': {
    title: 'Aile sofrası planlanır',
    text: 'Doyurucu, çok porsiyonlu ve market sepetine kolay dönüşen yemekler seçilir.',
    metric: '4 aile menüsü',
    icon: 'people-outline',
  },
  'Öğrenci modu': {
    title: 'Az malzemeli seçenekler',
    text: 'Kolay bulunan ürünlerle yapılan, düşük eforlu ve doyurucu tarifler hazırlanır.',
    metric: '6 sade tarif',
    icon: 'school-outline',
  },
  'Zaman kazanmak': {
    title: 'Karar süresi kısalır',
    text: 'Bugün ne pişirsem sorusuna daha hızlı cevap veren hazır seçimler gösterilir.',
    metric: '3 hızlı plan',
    icon: 'flash-outline',
  },
};

type UserGoalSelectorProps = {
  value: UserGoal;
  onChange: (goal: UserGoal) => void;
  onOpenRecommendations?: () => void;
};

export function UserGoalSelector({ value, onChange, onOpenRecommendations }: UserGoalSelectorProps) {
  const detail = goalDetails[value];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Beslenme Hedefin</Text>
          <Text style={styles.subtitle}>Öneriler bu hedefe göre hazırlanacak</Text>
        </View>
        <Ionicons name="flag-outline" size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.row}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal}
            onPress={() => onChange(goal)}
            activeOpacity={0.85}
            style={[styles.chip, value === goal && styles.activeChip]}
          >
            <Text style={[styles.chipText, value === goal && styles.activeChipText]}>{goal}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.insightCard}>
        <View style={styles.insightIcon}>
          <Ionicons name={detail.icon} size={19} color={theme.colors.primary} />
        </View>
        <View style={styles.insightCopy}>
          <Text style={styles.insightTitle}>{detail.title}</Text>
          <Text style={styles.insightText}>{detail.text}</Text>
          <View style={styles.insightMetaRow}>
            <View style={styles.insightPill}>
              <Ionicons name="sparkles-outline" size={12} color={theme.colors.primary} />
              <Text style={styles.insightPillText}>{detail.metric}</Text>
            </View>
            <View style={styles.insightPill}>
              <Ionicons name="basket-outline" size={12} color={theme.colors.primary} />
              <Text style={styles.insightPillText}>Sepete uygun</Text>
            </View>
          </View>
        </View>
        {onOpenRecommendations ? (
          <TouchableOpacity
            onPress={onOpenRecommendations}
            activeOpacity={0.84}
            style={styles.insightButton}
            accessibilityRole="button"
            accessibilityLabel={`${value} hedefine göre tarifleri keşfet`}
          >
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 38,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  insightCard: {
    borderRadius: 22,
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFE0CF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: {
    flex: 1,
  },
  insightTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  insightText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  insightMetaRow: {
    marginTop: 9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  insightPill: {
    minHeight: 26,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightPillText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  insightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
