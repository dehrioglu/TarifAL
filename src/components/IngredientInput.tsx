import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useFeedback } from '../feedback/FeedbackProvider';

type IngredientInputProps = {
  onAdd: (ingredient: string) => void;
};

export function IngredientInput({ onAdd }: IngredientInputProps) {
  const [value, setValue] = useState('');
  const { showToast } = useFeedback();

  const submit = () => {
    const next = value.trim();

    if (!next) {
      showToast('Eklemek için bir malzeme adı yaz.', 'warning');
      return;
    }

    onAdd(next);
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      <Ionicons name="leaf-outline" size={18} color={theme.colors.subtle} />
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        placeholder="Malzeme yaz ve ekle"
        placeholderTextColor={theme.colors.subtle}
        returnKeyType="done"
        style={styles.input}
      />
      <TouchableOpacity
        onPress={submit}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Malzeme ekle"
        style={styles.button}
      >
        <Ionicons name="add" size={21} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingLeft: 14,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 12,
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
