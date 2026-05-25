import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { formatFollowerCount } from '../data/mockSocial';
import { SocialUser } from '../types';
import { FollowButton } from './FollowButton';
import { UserAvatar } from './UserAvatar';

type UserProfileCardProps = {
  user: SocialUser;
  following: boolean;
  onPress: () => void;
  onToggleFollow: () => void;
};

export function UserProfileCard({ user, following, onPress, onToggleFollow }: UserProfileCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <UserAvatar uri={user.avatarUrl} name={user.name} size={56} />
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          {user.isVerified ? <Ionicons name="checkmark-circle" size={15} color={theme.colors.primary} /> : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {user.level} · {formatFollowerCount(user.followers)} takipci
        </Text>
        <View style={styles.badges}>
          {user.badges.slice(0, 2).map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      </View>
      <FollowButton following={following} onPress={onToggleFollow} compact />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    minHeight: 118,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  copy: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  meta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  badges: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.78,
  },
});
