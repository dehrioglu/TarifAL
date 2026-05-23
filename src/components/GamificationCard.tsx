import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { demoBadges, demoKitchenLevel } from '../data/demoPremium';
import { theme } from '../constants/theme';

export function GamificationCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Mutfak Seviyen</Text>
          <Text style={styles.title}>Seviye {demoKitchenLevel.level} — {demoKitchenLevel.title}</Text>
        </View>
        <View style={styles.levelIcon}>
          <Ionicons name="flame-outline" size={22} color={theme.colors.primary} />
        </View>
      </View>

      <Text style={styles.summary}>
        Bu hafta {demoKitchenLevel.weeklyRecipes} tarif keşfettin. {demoKitchenLevel.streakDays} gün üst üste TarifAL’i açtın.
      </Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${demoKitchenLevel.progress}%` }]} />
      </View>
      <Text style={styles.nextReward}>Sıradaki rozet: {demoKitchenLevel.nextReward}</Text>

      <View style={styles.badges}>
        {demoBadges.map((badge) => (
          <View key={badge.id} style={[styles.badge, !badge.unlocked && styles.lockedBadge]}>
            <Ionicons
              name={badge.unlocked ? badge.icon : 'lock-closed-outline'}
              size={18}
              color={badge.unlocked ? theme.colors.primary : theme.colors.subtle}
            />
            <Text style={[styles.badgeText, !badge.unlocked && styles.lockedText]} numberOfLines={1}>
              {badge.title}
            </Text>
          </View>
        ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  levelIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  nextReward: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexGrow: 1,
    minWidth: '47%',
    minHeight: 38,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockedBadge: {
    backgroundColor: theme.colors.surface,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  lockedText: {
    color: theme.colors.subtle,
  },
});
