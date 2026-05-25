import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type CommentInputProps = {
  onSubmit: (text: string) => void;
};

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();

    if (!text) {
      return;
    }

    onSubmit(text);
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Yorumunu yaz..."
        placeholderTextColor={theme.colors.subtle}
        multiline
        style={styles.input}
      />
      <Pressable
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Yorumu gonder"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Ionicons name="send" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Gonder</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 10,
  },
  input: {
    minHeight: 64,
    maxHeight: 118,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 10,
    color: theme.colors.text,
    textAlignVertical: 'top',
    fontWeight: '700',
  },
  button: {
    minHeight: 42,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
