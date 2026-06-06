import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useFeedback } from '../feedback/FeedbackProvider';
import { useAppStore } from '../store/useAppStore';
import { AppButton } from './AppButton';

type BetaInviteModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function BetaInviteModal({ visible, onClose }: BetaInviteModalProps) {
  const user = useAppStore((store) => store.user);
  const profile = useAppStore((store) => store.profile);
  const accountMode = useAppStore((store) => store.accountMode);
  const joinBetaProgram = useAppStore((store) => store.joinBetaProgram);
  const { showToast } = useFeedback();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isBetaTester = Boolean(profile?.isBetaTester || user?.isBetaTester);

  const close = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    setError('');

    try {
      await joinBetaProgram(code);
      showToast('Beta Test Kullanıcısı rozetin aktif edildi.');
      setCode('');
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Davet kodu geçersiz. Lütfen tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="rocket-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Davetli beta</Text>
              <Text style={styles.title}>Beta erişimini etkinleştir</Text>
              <Text style={styles.description}>
                TarifAL ekibinden aldığın davet kodunu gir. Beta görevleri, rozet ve geri bildirim akışı profilinde açılır.
              </Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Beta modalını kapat" onPress={close} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          {isBetaTester ? (
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
              <View style={styles.successCopy}>
                <Text style={styles.successTitle}>Beta rozetin aktif</Text>
                <Text style={styles.successText}>
                  {accountMode === 'demo'
                    ? 'Demo modda beta rozeti lokal gösterilir; Firestore’a kayıt yazılmaz.'
                    : 'Gerçek hesapta beta alanların Firestore kullanıcı profiline kaydedildi.'}
                </Text>
              </View>
            </View>
          ) : (
            <>
              <TextInput
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                placeholder="Davet kodunu gir"
                placeholderTextColor={theme.colors.subtle}
                style={styles.input}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.privateCodeCard}>
                <View style={styles.privateCodeIcon}>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.colors.primary} />
                </View>
                <View style={styles.privateCodeCopy}>
                  <Text style={styles.privateCodeTitle}>Kodlar yalnızca davetle verilir</Text>
                  <Text style={styles.privateCodeText}>
                    Davet kodunu TarifAL ekibinden aldıysan burada güvenli şekilde etkinleştirebilirsin.
                  </Text>
                </View>
              </View>
              <AppButton
                title="Beta Erişimini Etkinleştir"
                icon="checkmark-circle-outline"
                onPress={handleJoin}
                loading={loading}
                disabled={!code.trim()}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.42)',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 16,
    ...theme.shadow,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFD8C5',
    backgroundColor: '#FFF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  description: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  errorText: {
    borderRadius: 14,
    backgroundColor: '#FFF1F1',
    color: theme.colors.danger,
    padding: 10,
    fontSize: 12,
    fontWeight: '800',
  },
  privateCodeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  privateCodeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateCodeCopy: {
    flex: 1,
  },
  privateCodeTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  privateCodeText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  successCard: {
    borderRadius: 20,
    backgroundColor: '#ECFDF3',
    padding: 13,
    flexDirection: 'row',
    gap: 10,
  },
  successCopy: {
    flex: 1,
  },
  successTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  successText: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
});
