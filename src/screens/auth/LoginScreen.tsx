import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { BrandLogo } from '../../components/BrandLogo';
import { InputField } from '../../components/InputField';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useAppStore } from '../../store/useAppStore';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('tarifai@tarifai.com');
  const [password, setPassword] = useState('Test123!');
  const signIn = useAppStore((store) => store.signIn);
  const openDemoMode = useAppStore((store) => store.openDemoMode);
  const loading = useAppStore((store) => store.authLoading);
  const { showToast } = useFeedback();

  const handleSubmit = async () => {
    try {
      await signIn(email, password);
      navigation.getParent()?.navigate('MainTabs');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Giriş yapılamadı, tekrar deneyin.', 'warning');
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.hero}>
        <BrandLogo size={164} />
        <Text style={styles.subtitle}>Lezzeti sizden, tarifi bizden</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Tekrar hoş geldin</Text>
        <Text style={styles.helper}>Hesabına giriş yap</Text>

        <View style={styles.form}>
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
            placeholder="Şifre"
          />
          <AppButton title="Giriş Yap" onPress={handleSubmit} loading={loading} />
          <AppButton
            title="Demo Modunda Devam Et"
            icon="flask-outline"
            variant="soft"
            onPress={() => {
              openDemoMode();
              navigation.getParent()?.navigate('MainTabs');
            }}
          />
        </View>

        <View style={styles.inline}>
          <Text style={styles.inlineText}>Hesabın yok mu?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
            <Text style={styles.inlineAction}> Kayıt ol</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.demoText}>Demo: tarifai@tarifai.com / Test123!</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 36,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    borderRadius: theme.radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    ...theme.shadow,
  },
  title: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  helper: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    marginTop: 22,
    gap: 14,
  },
  inline: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  demoText: {
    marginTop: 26,
    textAlign: 'center',
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '600',
  },
});
