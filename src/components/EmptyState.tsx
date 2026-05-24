import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { BrandLogo } from './BrandLogo';

type EmptyStateProps = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  text?: string;
};

export function EmptyState({ icon = 'sparkles-outline', title, text }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
      <BrandLogo size={42} style={styles.brandLogo} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 146,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  brandLogo: {
    marginTop: 14,
    opacity: 0.72,
  },
});
