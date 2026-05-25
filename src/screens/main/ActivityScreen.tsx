import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../../components/Screen';
import { UserAvatar } from '../../components/UserAvatar';
import { theme } from '../../constants/theme';
import { mockSocialActivities, mockSocialUsers } from '../../data/mockSocial';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Activity'>;

export function ActivityScreen({ navigation }: Props) {
  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.86} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.topCopy}>
          <Text style={styles.title}>Aktivite Merkezi</Text>
          <Text style={styles.subtitle}>Sosyal tarif hareketleri ve kampanyali sepet sinyalleri.</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="pulse-outline" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Platform canli gorunumu</Text>
          <Text style={styles.summaryText}>
            Begeni, takip, bot onerisi ve kampanyali sepet aktiviteleri demo veriyle beslenir.
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {mockSocialActivities.map((activity) => {
          const actor = mockSocialUsers.find((user) => user.id === activity.actorId) ?? mockSocialUsers[0];

          return (
            <TouchableOpacity
              key={activity.id}
              onPress={() => navigation.navigate('SocialProfile', { userId: actor.id })}
              activeOpacity={0.86}
              style={styles.row}
            >
              <UserAvatar uri={actor.avatarUrl} name={actor.name} size={44} />
              <View style={styles.rowCopy}>
                <Text style={styles.rowText}>{activity.text}</Text>
                <Text style={styles.rowTime}>{activity.createdAt}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.subtle} />
            </TouchableOpacity>
          );
        })}
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
  list: {
    marginTop: 18,
    gap: 10,
  },
  row: {
    minHeight: 74,
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
  rowCopy: {
    flex: 1,
  },
  rowText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  rowTime: {
    marginTop: 4,
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '800',
  },
});
