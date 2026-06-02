import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { BrandLogo } from '../BrandLogo';

type HeaderGreetingProps = {
  firstName: string;
  unreadCount?: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
};

export function HeaderGreeting({
  firstName,
  unreadCount = 0,
  onOpenNotifications,
  onOpenProfile,
}: HeaderGreetingProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <BrandLogo size={52} />
        <View style={styles.copy}>
          <Text style={styles.greeting}>Merhaba {firstName} 👋</Text>
          <Text style={styles.tagline}>Lezzeti sizden, tarifi bizden.</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onOpenNotifications}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Bildirimler"
          style={styles.iconButton}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          {unreadCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{Math.min(9, unreadCount)}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onOpenProfile}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Profil"
          style={[styles.iconButton, styles.profileButton]}
        >
          <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
  },
  greeting: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  tagline: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: '#FFE1D1',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderColor: '#FFFFFF',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
