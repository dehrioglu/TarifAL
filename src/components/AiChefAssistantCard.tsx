import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

const actions = ['Daha sağlıklı yap', 'Daha ekonomik yap', '20 dakikada hazır olsun', 'Çocuklara uygun yap'];

type AiChefAssistantCardProps = {
  onAction: (action: string) => void;
  message?: string;
  activeAction?: string;
};

export function AiChefAssistantCard({
  onAction,
  message = 'Evde ne var? Sana tarif önereyim.',
  activeAction,
}: AiChefAssistantCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>AI Şef Asistanı</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action}
            onPress={() => onAction(action)}
            activeOpacity={0.85}
            style={[styles.action, activeAction === action && styles.activeAction]}
          >
            <Text style={[styles.actionText, activeAction === action && styles.activeActionText]}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.text,
    padding: 16,
    gap: 14,
    overflow: 'hidden',
    ...theme.shadow,
    shadowOpacity: 0.08,
  },
  glow: {
    position: 'absolute',
    right: -28,
    top: -30,
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(255, 90, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  message: {
    marginTop: 4,
    color: '#D0D5DD',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  action: {
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  activeAction: {
    backgroundColor: '#FFFFFF',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  activeActionText: {
    color: theme.colors.primary,
  },
});
