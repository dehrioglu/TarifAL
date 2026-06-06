import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type DataSyncBannerProps = {
  message?: string;
};

export function DataSyncBanner({ message }: DataSyncBannerProps) {
  if (!message) {
    return null;
  }

  const friendlyMessage =
    message.includes('Firebase') || message.includes('Firestore') || message.includes('İnternet')
      ? 'Veri senkronizasyonu geçici olarak bekliyor. Uygulama mevcut verilerle çalışmaya devam ediyor.'
      : message;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-outline" size={18} color={theme.colors.muted} />
      <Text style={styles.text}>{friendlyMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  text: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
});
