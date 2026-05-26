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
    width: '48%',
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 12,
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
});
