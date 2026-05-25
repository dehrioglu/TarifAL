import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../constants/theme';

type FollowButtonProps = {
  following: boolean;
  onPress: () => void;
  compact?: boolean;
};

export function FollowButton({ following, onPress, compact = false }: FollowButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={following ? 'Takibi birak' : 'Takip et'}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        following ? styles.following : styles.follow,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, following ? styles.followingText : styles.followText]}>
        {following ? 'Takip Ediliyor' : 'Takip Et'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    minHeight: 34,
    paddingHorizontal: 12,
  },
  follow: {
    backgroundColor: theme.colors.primary,
  },
  following: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
  },
  followText: {
    color: '#FFFFFF',
  },
  followingText: {
    color: theme.colors.text,
  },
  pressed: {
    opacity: 0.72,
  },
});
