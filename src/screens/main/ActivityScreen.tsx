import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { NotificationCenter } from '../../components/NotificationCenter';
import { DailyReturnCard } from '../../components/retention/DailyReturnCard';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { mockNotifications } from '../../data/mockNotifications';
import { mockSocialActivities, mockSocialRecipes, mockSocialUsers } from '../../data/mockSocial';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useDailyReturn } from '../../retention/useDailyReturn';
import { SocialUser } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Activity'>;

export function ActivityScreen({ navigation }: Props) {
  const currentUser = useAppStore((store) => store.user);
  const readNotifications = useAppStore((store) => store.readNotifications);
  const markNotificationRead = useAppStore((store) => store.markNotificationRead);
  const markAllNotificationsRead = useAppStore((store) => store.markAllNotificationsRead);
  const { showToast } = useFeedback();
  const { streak, completedToday, completeDailyAction } = useDailyReturn();

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

  const openNotification = (notification: (typeof mockNotifications)[number]) => {
    markNotificationRead(notification.id);
    showToast('Bildirim okundu olarak işaretlendi.', 'info');

    if (notification.targetId?.startsWith('recipe-')) {
      navigation.navigate('RecipeDetail', { recipeId: notification.targetId });
      return;
    }

    if (notification.targetId?.startsWith('collection-')) {
      navigation.navigate('CollectionDetail', { collectionId: notification.targetId });
      return;
    }

    if (notification.targetId?.startsWith('post-')) {
      const post = mockSocialRecipes.find((item) => item.id === notification.targetId);
      if (post) {
        navigation.navigate('RecipeDetail', { recipeId: post.recipeId, socialPostId: post.id });
        return;
      }
    }

    if (notification.type === 'follow') {
      navigation.navigate('SocialProfile', { userId: notification.actorId });
      return;
    }

    navigation.navigate('AiChefChat');
  };

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

      <View style={styles.returnWrap}>
        <DailyReturnCard
          streak={streak}
          completedToday={completedToday}
          onPress={() => {
            void completeDailyAction();
            navigation.navigate('AiChefChat');
            showToast('TarifAL Bot günlük önerini hazırlıyor.', 'info');
          }}
        />
      </View>

      <View style={styles.returnGrid}>
        <ReturnAction
          icon="leaf-outline"
          title="3 ürün bekliyor"
          text="Dolabındaki ürünleri değerlendirecek tarifleri gör."
          onPress={() => navigation.navigate('PantryVision')}
        />
        <ReturnAction
          icon="sparkles-outline"
          title="Akşam önerin hazır"
          text="Bütçene uygun üç tarifi AI Şef seçti."
          onPress={() => navigation.navigate('AiChefChat')}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <TouchableOpacity
          onPress={() => {
            markAllNotificationsRead(mockNotifications.map((notification) => notification.id));
            showToast('Tüm bildirimler okundu olarak işaretlendi.', 'info');
          }}
          activeOpacity={0.84}
          disabled={unreadCount === 0}
        >
          <Text style={[styles.sectionAction, unreadCount === 0 && styles.disabledAction]}>
            {unreadCount > 0 ? 'Tümünü okundu yap' : 'Bildirimler güncel'}
          </Text>
        </TouchableOpacity>
      </View>
      <NotificationCenter
        notifications={mockNotifications}
        usersById={usersById}
        readIds={readNotifications}
        onPressNotification={openNotification}
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

function ReturnAction({
  icon,
  title,
  text,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84} style={styles.returnAction}>
      <View style={styles.returnActionIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.returnActionTitle}>{title}</Text>
      <Text style={styles.returnActionText}>{text}</Text>
    </TouchableOpacity>
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
  returnWrap: {
    marginTop: 14,
  },
  returnGrid: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 9,
  },
  returnAction: {
    flex: 1,
    minHeight: 132,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 12,
  },
  returnActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnActionTitle: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  returnActionText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 15,
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
  disabledAction: {
    color: theme.colors.subtle,
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
