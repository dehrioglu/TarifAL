import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { SocialNotification, SocialUser } from '../types';
import { UserAvatar } from './UserAvatar';

type NotificationCenterProps = {
  notifications: SocialNotification[];
  usersById: Record<string, SocialUser>;
  readIds: Record<string, boolean>;
  onPressNotification: (notification: SocialNotification) => void;
};

export function NotificationCenter({
  notifications,
  usersById,
  readIds,
  onPressNotification,
}: NotificationCenterProps) {
  return (
    <View style={styles.list}>
      {notifications.map((notification) => {
        const actor = usersById[notification.actorId];
        const read = readIds[notification.id] ?? notification.isRead;

        return (
          <TouchableOpacity
            key={notification.id}
            onPress={() => onPressNotification(notification)}
            activeOpacity={0.86}
            style={[styles.row, !read && styles.unreadRow]}
          >
            {actor ? (
              <UserAvatar uri={actor.avatarUrl} name={actor.name} size={44} />
            ) : (
              <View style={styles.fallbackAvatar}>
                <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
              </View>
            )}
            <View style={styles.copy}>
              <Text style={styles.text}>{notification.text}</Text>
              <Text style={styles.time}>{notification.createdAt}</Text>
            </View>
            {notification.imageUrl ? <Image source={{ uri: notification.imageUrl }} style={styles.thumb} /> : null}
            {!read ? <View style={styles.unreadDot} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    minHeight: 78,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.03,
  },
  unreadRow: {
    borderColor: '#FFD1B8',
    backgroundColor: '#FFF8F4',
  },
  fallbackAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  text: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  time: {
    marginTop: 4,
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '800',
  },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  unreadDot: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: theme.colors.primary,
  },
});
