import { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type AppButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'soft' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: AppButtonProps) {
  const isPrimary = variant === 'primary';
  const color = isPrimary ? '#FFFFFF' : theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        isPrimary && theme.orangeShadow,
        (pressed || disabled) && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={color} /> : null}
          <Text style={[styles.text, { color }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  soft: {
    backgroundColor: theme.colors.primarySoft,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.72,
  },
  text: {
    fontWeight: '800',
    fontSize: 15,
  },
});
