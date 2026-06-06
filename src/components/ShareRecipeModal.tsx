import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type ShareRecipeModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onAction: (message: string) => void;
};

const shareOptions = [
  { label: 'TarifAL içinde paylaş', icon: 'people-outline', message: 'TarifAL akışında paylaşım hazırlandı.' },
  { label: 'Koleksiyona ekle', icon: 'albums-outline', message: 'Tarif koleksiyonuna eklendi.' },
  { label: 'Linki kopyala', icon: 'link-outline', message: 'Paylaşım bağlantısı kopyalandı.' },
  { label: "WhatsApp'ta paylaş", icon: 'logo-whatsapp', message: 'WhatsApp paylaşım bağlantısı hazırlandı.' },
  { label: 'Instagram hikayesi', icon: 'logo-instagram', message: 'Instagram hikayesi için paylaşım görseli hazırlandı.' },
  { label: 'Dışa aktar', icon: 'download-outline', message: 'Tarif dışa aktarma için hazırlandı.' },
] as const;

export function ShareRecipeModal({ visible, title, onClose, onAction }: ShareRecipeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Sosyal paylaşım</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.84} style={styles.close}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => {
                  onAction(option.message);
                  onClose();
                }}
                activeOpacity={0.86}
                style={styles.option}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.optionText}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.subtle} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,16,32,0.44)',
    padding: 22,
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...theme.shadow,
    shadowOpacity: 0.16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    marginTop: 14,
    gap: 9,
  },
  option: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
});
