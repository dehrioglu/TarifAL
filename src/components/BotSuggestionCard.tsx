import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type BotSuggestionCardProps = {
  title: string;
  response: string;
  onPress: () => void;
};

export function BotSuggestionCard({ title, response, onPress }: BotSuggestionCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.86} style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="sparkles" size={17} color={theme.colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.response} numberOfLines={2}>{response}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 230,
    minHeight: 118,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 13,
    gap: 10,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 5,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  response: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
});
