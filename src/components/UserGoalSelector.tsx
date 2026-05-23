import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

type UserGoalSelectorProps = {
  value: UserGoal;
  onChange: (goal: UserGoal) => void;
};

export function UserGoalSelector({ value, onChange }: UserGoalSelectorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Beslenme Hedefin</Text>
          <Text style={styles.subtitle}>Öneriler bu hedefe göre hazırlanacak</Text>
        </View>
        <Ionicons name="flag-outline" size={22} color={theme.colors.primary} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
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
      </ScrollView>
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
});
