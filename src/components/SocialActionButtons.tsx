import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type SocialIconButtonProps = {
  label: string;
  count?: number;
  active?: boolean;
  icon: IconName;
  activeIcon?: IconName;
  onPress: () => void;
};

export function SocialIconButton({
  label,
  count,
  active,
  icon,
  activeIcon,
  onPress,
}: SocialIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={active ? activeIcon ?? icon : icon}
        size={20}
        color={active ? theme.colors.primary : theme.colors.muted}
      />
      <Text style={[styles.text, active && styles.activeText]}>
        {typeof count === 'number' ? count.toLocaleString('tr-TR') : label}
      </Text>
    </Pressable>
  );
}

export const LikeButton = (props: Omit<SocialIconButtonProps, 'icon' | 'activeIcon' | 'label'>) => (
  <SocialIconButton {...props} label="Begen" icon="heart-outline" activeIcon="heart" />
);

export const SaveButton = (props: Omit<SocialIconButtonProps, 'icon' | 'activeIcon' | 'label'>) => (
  <SocialIconButton {...props} label="Kaydet" icon="bookmark-outline" activeIcon="bookmark" />
);

export const ShareButton = (props: Omit<SocialIconButtonProps, 'icon' | 'activeIcon' | 'label' | 'active'>) => (
  <SocialIconButton {...props} label="Paylas" icon="share-social-outline" />
);

const styles = StyleSheet.create({
  button: {
    minHeight: 38,
    minWidth: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  text: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  activeText: {
    color: theme.colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
