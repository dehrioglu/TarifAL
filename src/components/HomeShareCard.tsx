import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { demoHomeActivities } from '../data/demoPremium';
import { theme } from '../constants/theme';

type HomeShareCardProps = {
  onOpenFamilyAccount?: () => void;
};

export function HomeShareCard({ onOpenFamilyAccount }: HomeShareCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ev Listesi</Text>
          <Text style={styles.subtitle}>Aynı evdeki herkes alışveriş listesine ürün ekleyebilir.</Text>
        </View>
        <View style={styles.members}>
          {['S', 'A', 'E'].map((letter) => (
            <View key={letter} style={styles.member}>
              <Text style={styles.memberText}>{letter}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.activities}>
        {demoHomeActivities.map((activity) => (
          <View key={activity.id} style={styles.activity}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
            <View style={styles.activityCopy}>
              <Text style={styles.activityText}>{activity.actor}: {activity.text}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={onOpenFamilyAccount} activeOpacity={0.86} style={styles.button}>
        <Text style={styles.buttonText}>Ev Hesabını Aç</Text>
      </TouchableOpacity>
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
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  members: {
    flexDirection: 'row',
    marginTop: 2,
  },
  member: {
    width: 30,
    height: 30,
    marginLeft: -7,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  activities: {
    gap: 9,
  },
  activity: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
  },
  activityCopy: {
    flex: 1,
  },
  activityText: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  activityTime: {
    marginTop: 2,
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '700',
  },
  button: {
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
});
