import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { AccountMode } from '../types';

type AccountModeBadgeProps = {
  mode: AccountMode;
};

export function AccountModeBadge({ mode }: AccountModeBadgeProps) {
  const isAccount = mode === 'account';

  return (
    <View style={[styles.badge, isAccount && styles.accountBadge]}>
      <Ionicons
        name={isAccount ? 'cloud-done-outline' : 'flask-outline'}
        size={14}
        color={isAccount ? theme.colors.success : theme.colors.primary}
      />
      <Text style={[styles.text, isAccount && styles.accountText]}>
        {isAccount ? 'Gerçek Hesap' : 'Misafir Modu'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFD9C5',
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountBadge: {
    borderColor: '#C9F1DD',
    backgroundColor: '#ECFDF3',
  },
  text: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  accountText: {
    color: theme.colors.success,
  },
});
