import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { InputField } from '../../components/InputField';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { AuthStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signUp = useAppStore((store) => store.signUp);
  const loading = useAppStore((store) => store.authLoading);
  const { showToast } = useFeedback();

  const handleSubmit = async () => {
    try {
      await signUp(name, email, password);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Kayıt tamamlanamadı, tekrar deneyin.', 'warning');
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Geri dön"
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={30} color={theme.colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Hesap oluştur</Text>
      <Text style={styles.subtitle}>Hemen tarif paylaşmaya başla</Text>

      <View style={styles.card}>
        <InputField icon="person-outline" value={name} onChangeText={setName} placeholder="Ad Soyad" />
        <InputField
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-posta"
        />
        <InputField
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Şifre (en az 6 karakter)"
        />
        <AppButton title="Kayıt Ol" onPress={handleSubmit} loading={loading} style={styles.button} />

        <View style={styles.inline}>
          <Text style={styles.inlineText}>Zaten hesabın var mı?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.inlineAction}> Giriş yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginBottom: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 14,
  },
  card: {
    marginTop: 24,
    padding: 22,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    gap: 14,
    ...theme.shadow,
  },
  button: {
    marginTop: 8,
  },
  inline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  inlineText: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  inlineAction: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 13,
  },
});
