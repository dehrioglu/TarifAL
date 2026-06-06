import { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type HomeQuickCreateAction = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  onPress: () => void;
};

type HomeQuickCreateMenuProps = {
  visible: boolean;
  onClose: () => void;
  actions: HomeQuickCreateAction[];
};

export function HomeQuickCreateMenu({
  visible,
  onClose,
  actions,
}: HomeQuickCreateMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable onPress={onClose} accessibilityLabel="Hızlı aksiyonları kapat" style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>HIZLI BAŞLA</Text>
              <Text style={styles.title}>Mutfağında ne yapmak istersin?</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              style={styles.close}
            >
              <Ionicons name="close" size={19} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => {
                  onClose();
                  setTimeout(action.onPress, 120);
                }}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityLabel={action.title}
                style={styles.action}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon} size={19} color={theme.colors.primary} />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={theme.colors.subtle} />
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
    backgroundColor: 'rgba(11,16,32,0.36)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: 26,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    backgroundColor: '#D0D5DD',
  },
  header: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 19,
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
  list: {
    marginTop: 14,
    gap: 8,
  },
  action: {
    minHeight: 66,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  actionDescription: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
});
