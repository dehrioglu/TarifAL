import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Ingredient, IngredientBrandOption } from '../types';
import { BrandOptionCard } from './BrandOptionCard';

type BrandSelectorProps = {
  visible: boolean;
  ingredient?: Ingredient;
  brands: IngredientBrandOption[];
  selectedBrandId?: string;
  onSelect: (brand: IngredientBrandOption) => void;
  onClose: () => void;
};

export function BrandSelector({
  visible,
  ingredient,
  brands,
  selectedBrandId,
  onSelect,
  onClose,
}: BrandSelectorProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>Marka seçimi</Text>
              <Text style={styles.title}>{ingredient?.name ?? 'Malzeme'}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Kapat" style={styles.close}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Marka değişince market sepeti fiyatı canlı güncellenir. Bu alan ileride gerçek market API fiyatlarına bağlanabilir.
          </Text>
          <View style={styles.list}>
            {brands.map((brand) => (
              <BrandOptionCard
                key={brand.id}
                brand={brand}
                selected={brand.id === selectedBrandId}
                onPress={() => {
                  onSelect(brand);
                  onClose();
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11,16,32,0.32)',
  },
  sheet: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    ...theme.shadow,
    shadowOpacity: 0.14,
  },
  handle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 3,
    color: theme.colors.text,
    fontSize: 22,
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
  subtitle: {
    marginTop: 10,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  list: {
    marginTop: 14,
    gap: 10,
  },
});
