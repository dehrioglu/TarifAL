import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { theme } from '../constants/theme';
import { Recipe } from '../types';

type VoiceKitchenModeProps = {
  recipe: Recipe;
  visible: boolean;
  onClose: () => void;
};

export function VoiceKitchenMode({ recipe, visible, onClose }: VoiceKitchenModeProps) {
  const firstStep = recipe.steps[0]?.text ?? 'Tarif adımlarını takip etmeye hazırsın.';
  const [demoFeedback, setDemoFeedback] = useState('');

  const listenDemoCommand = () => {
    setDemoFeedback('Demo komut algılandı: “Sonraki adım”. Gerçek sesli komut MVP sonrası bağlanacak.');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Sesli Mutfak Modu</Text>
            <Text style={styles.title}>{recipe.title}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Sesli mutfak modunu kapat"
            style={styles.close}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.demoBadge}>
          <Ionicons name="mic-outline" size={17} color={theme.colors.primary} />
          <Text style={styles.demoText}>Sesli komut demo modu</Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepLabel}>Büyük adım kartı</Text>
          <Text style={styles.stepText}>{firstStep}</Text>
        </View>

        <View style={styles.commandGrid}>
          {['Sonraki adım', 'Malzemeleri oku', 'Zamanlayıcı başlat'].map((command) => (
            <View key={command} style={styles.command}>
              <Ionicons name="radio-button-on" size={14} color={theme.colors.primary} />
              <Text style={styles.commandText}>“{command}”</Text>
            </View>
          ))}
        </View>

        {demoFeedback ? <Text style={styles.feedback}>{demoFeedback}</Text> : null}

        <TouchableOpacity
          onPress={listenDemoCommand}
          activeOpacity={0.86}
          accessibilityRole="button"
          accessibilityLabel="Demo sesli komutu dinle"
          style={styles.primaryButton}
        >
          <Ionicons name="mic" size={18} color="#FFFFFF" />
          <Text style={styles.primaryText}>Demo Komutu Dinle</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: theme.screen.padding,
    gap: 18,
  },
  header: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  title: {
    marginTop: 5,
    color: theme.colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  demoText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  stepCard: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 24,
    justifyContent: 'center',
    gap: 14,
  },
  stepLabel: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  stepText: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 37,
    fontWeight: '900',
  },
  commandGrid: {
    gap: 10,
  },
  command: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  commandText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  feedback: {
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    padding: 12,
    color: theme.colors.primary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
});
