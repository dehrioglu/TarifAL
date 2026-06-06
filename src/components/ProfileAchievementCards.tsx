import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type ProfileAchievementCardsProps = {
  achievements: string[];
};

const achievementIcons = [
  'trophy-outline',
  'heart-outline',
  'bookmark-outline',
  'wallet-outline',
  'checkmark-circle-outline',
] as const;

export function ProfileAchievementCards({ achievements }: ProfileAchievementCardsProps) {
  return (
    <View style={styles.grid}>
      {achievements.map((achievement, index) => (
        <View key={achievement} style={styles.card}>
          <View style={styles.icon}>
            <Ionicons
              name={achievementIcons[index % achievementIcons.length]}
              size={18}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.text}>{achievement}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    flexBasis: '47.5%',
    flexGrow: 1,
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '900',
  },
});
