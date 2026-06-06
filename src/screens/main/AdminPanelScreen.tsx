import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { BrandLogo } from '../../components/BrandLogo';
import { DataSyncBanner } from '../../components/DataSyncBanner';
import { FounderMetricsPanel } from '../../components/FounderMetricsPanel';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useFeedback } from '../../feedback/FeedbackProvider';
import { useAppStore } from '../../store/useAppStore';
import { RootStackParamList } from '../../navigation/types';
import { isAdminUser } from '../../utils/profileIdentity';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminPanel'>;

export function AdminPanelScreen({ navigation }: Props) {
  const user = useAppStore((store) => store.user);
  const dataError = useAppStore((store) => store.dataError);
  const { showToast } = useFeedback();
  const isFounderAccount = isAdminUser(user);

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <AppButton
          title="Geri"
          icon="chevron-back"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.logoWrap}>
          <BrandLogo size={56} />
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.eyebrow}>TarifAL Admin</Text>
        <Text style={styles.title}>Kurucu yönetim paneli</Text>
        <Text style={styles.description}>
          Sipariş takibi, beta geri bildirimleri ve yatırımcı metrikleri uygulamadan ayrı, kontrollü bir alanda yönetilir.
        </Text>
      </View>

      <DataSyncBanner message={dataError} />

      {isFounderAccount ? (
        <FounderMetricsPanel />
      ) : (
        <View style={styles.lockedCard}>
          <View style={styles.lockedIcon}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.lockedTitle}>Bu alan kurucu hesabına özel</Text>
          <Text style={styles.lockedText}>
            Admin paneli sadece kervankayaenes@gmail.com hesabıyla açılır. Farklı hesaplarda uygulama normal kullanıcı modu olarak kalır.
          </Text>
          <AppButton
            title="Profilime Dön"
            icon="person-outline"
            onPress={() => {
              showToast('Admin paneli kurucu hesabına özel.', 'warning');
              navigation.goBack();
            }}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingTop: 18,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    minHeight: 42,
    paddingHorizontal: 8,
  },
  logoWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
    shadowOpacity: 0.06,
  },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 18,
    gap: 8,
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  lockedCard: {
    minHeight: 260,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  lockedIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  lockedText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
});
