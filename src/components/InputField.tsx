import { ComponentProps, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type InputFieldProps = TextInputProps & {
  icon?: IconName;
  containerStyle?: StyleProp<ViewStyle>;
};

export function InputField({
  icon,
  containerStyle,
  secureTextEntry,
  placeholderTextColor = theme.colors.subtle,
  style,
  ...props
}: InputFieldProps) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  return (
    <View style={[styles.container, containerStyle]}>
      {icon ? <Ionicons name={icon} size={20} color={theme.colors.subtle} /> : null}
      <TextInput
        {...props}
        secureTextEntry={hidden}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, style]}
      />
      {secureTextEntry ? (
        <TouchableOpacity onPress={() => setHidden((value) => !value)} activeOpacity={0.8}>
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.colors.subtle} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
});
