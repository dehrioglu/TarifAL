import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { BrandLogo } from './BrandLogo';

type SmartBasketSuccessProps = {
  onGoCart: () => void;
  onRestart: () => void;
};

export function SmartBasketSuccess({ onGoCart, onRestart }: SmartBasketSuccessProps) {
  return (
    <View style={styles.card}>
      <View style={styles.logoWrap}>
        <BrandLogo size={88} />
      </View>
      <View style={styles.checkWrap}>
        <Ionicons name="checkmark" size={30} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>Akıllı sepetin hazır</Text>
      <Text style={styles.description}>Tarif için eksik ürünler market sepetine aktarıldı.</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onGoCart} activeOpacity={0.88} style={styles.primaryButton}>
          <Ionicons name="cart" size={17} color="#FFFFFF" />
          <Text style={styles.primaryText}>Sepete Git</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRestart} activeOpacity={0.88} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Yeni Plan Oluştur</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 20,
    alignItems: 'center',
    gap: 12,
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  logoWrap: {
    width: 116,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
});
