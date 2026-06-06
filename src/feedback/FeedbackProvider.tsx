import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type ToastType = 'success' | 'info' | 'warning';

type ToastState = {
  message: string;
  type: ToastType;
};

type ActionModalState = {
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

type FeedbackContextValue = {
  showToast: (message: string, type?: ToastType) => void;
  showDemoModal: (options: ActionModalState) => void;
  showComingSoon: (message?: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [modal, setModal] = useState<ActionModalState | null>(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 2400);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  const showDemoModal = useCallback((options: ActionModalState) => {
    setModal(options);
  }, []);

  const showComingSoon = useCallback((message?: string) => {
    setModal({
      title: 'Yakında',
      message:
        message ??
        'Bu özellik beta süreci sonrasında gerçek entegrasyonla aktif edilecek. Şimdilik güvenli test akışıyla gösteriliyor.',
      primaryLabel: 'Tamam',
    });
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      showDemoModal,
      showComingSoon,
    }),
    [showComingSoon, showDemoModal, showToast],
  );

  const closeModal = () => setModal(null);
  const handlePrimary = () => {
    const action = modal?.onPrimary;
    setModal(null);
    action?.();
  };
  const handleSecondary = () => {
    const action = modal?.onSecondary;
    setModal(null);
    action?.();
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {toast ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={[styles.toast, toast.type === 'warning' && styles.warningToast]}>
            <Ionicons
              name={toast.type === 'warning' ? 'alert-circle' : toast.type === 'info' ? 'information-circle' : 'checkmark-circle'}
              size={18}
              color={toast.type === 'warning' ? '#B54708' : theme.colors.primary}
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      ) : null}

      <Modal visible={Boolean(modal)} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="sparkles" size={23} color={theme.colors.primary} />
            </View>
            <Text style={styles.modalTitle}>{modal?.title}</Text>
            <Text style={styles.modalMessage}>{modal?.message}</Text>
            <View style={styles.modalActions}>
              {modal?.secondaryLabel ? (
                <Pressable
                  onPress={handleSecondary}
                  accessibilityRole="button"
                  accessibilityLabel={modal.secondaryLabel}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryText}>{modal.secondaryLabel}</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={handlePrimary}
                accessibilityRole="button"
                accessibilityLabel={modal?.primaryLabel ?? 'Tamam'}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryText}>{modal?.primaryLabel ?? 'Tamam'}</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={closeModal}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeText}>Kapat</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }

  return context;
};

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 100,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    maxWidth: 680,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...theme.shadow,
    shadowOpacity: 0.1,
  },
  warningToast: {
    borderColor: '#FEDF89',
    backgroundColor: '#FFFAEB',
  },
  toastText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.38)',
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    gap: 12,
    ...theme.shadow,
  },
  modalIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  modalMessage: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 9,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  closeButton: {
    minHeight: 32,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  closeText: {
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
