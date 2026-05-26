import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { NotificationCenter } from '../../components/NotificationCenter';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { mockNotifications } from '../../data/mockNotifications';
import { mockSocialActivities, mockSocialUsers } from '../../data/mockSocial';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { SocialUser } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Activity'>;

export function ActivityScreen({ navigation }: Props) {
  const currentUser = useAppStore((store) => store.user);
  const readNotifications = useAppStore((store) => store.readNotifications);
  const markNotificationRead = useAppStore((store) => store.markNotificationRead);
  const { showToast } = useFeedback();

  const usersById = useMemo(() => {
    const demoUser: SocialUser = {
      id: currentUser?.id ?? 'demo-user',
      name: currentUser?.name ?? 'Enes Kervankaya',
      username: '@eneschef',
      avatarUrl:
        currentUser?.avatarUrl ??
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      coverImageUrl:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1200&auto=format&fit=crop',
      bio: 'TarifAL kurucusu.',
      location: 'İstanbul',
      followers: 1840,
      following: 86,
      recipeCount: 4,
      totalLikes: 24800,
      averageRating: 4.8,
      badges: ['Kurucu', 'TarifAL Onaylı'],
      level: 'TarifAL Kurucusu',
      isVerified: true,
      expertiseAreas: ['Akıllı sepet'],
    };

    return [demoUser, ...mockSocialUsers].reduce<Record<string, SocialUser>>((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }, [currentUser]);

  const unreadCount = mockNotifications.filter((notification) => !(readNotifications[notification.id] ?? notification.isRead)).length;

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.86} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.topCopy}>
          <Text style={styles.title}>Aktivite Merkezi</Text>
          <Text style={styles.subtitle}>Sosyal bildirimler, bot önerileri ve kampanyalı sepet sinyalleri.</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="pulse-outline" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Platform canlı görünümü</Text>
          <Text style={styles.summaryText}>
            {unreadCount} okunmamış bildirim var. Beğeni, yorum, takip, kampanya ve deneme aktiviteleri demo veriyle beslenir.
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <Text style={styles.sectionAction}>{mockNotifications.length} kayıt</Text>
      </View>
      <NotificationCenter
        notifications={mockNotifications}
        usersById={usersById}
        readIds={readNotifications}
        onPressNotification={(notification) => {
          markNotificationRead(notification.id);
          showToast('Bildirim okundu olarak işaretlendi.', 'info');

          if (notification.targetId?.startsWith('recipe-')) {
            navigation.navigate('RecipeDetail', { recipeId: notification.targetId });
          }
        }}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Canlı akış</Text>
        <Text style={styles.sectionAction}>Mock sosyal hareketler</Text>
      </View>
      <View style={styles.timeline}>
        {mockSocialActivities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            onPress={() => navigation.navigate('SocialProfile', { userId: activity.actorId })}
            activeOpacity={0.86}
            style={styles.timelineRow}
          >
            <View style={styles.timelineDot} />
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineText}>{activity.text}</Text>
              <Text style={styles.timelineTime}>{activity.createdAt}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: theme.colors.text,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  summaryText: {
    marginTop: 5,
    color: '#D0D5DD',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  sectionAction: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '900',
  },
  timeline: {
    gap: 10,
  },
  timelineRow: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    marginTop: 5,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  timelineCopy: {
    flex: 1,
  },
  timelineText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  timelineTime: {
    marginTop: 4,
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '800',
  },
});
