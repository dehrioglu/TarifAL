import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../components/AppButton';
import { Screen } from '../../components/Screen';
import { theme } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

export function CartScreen() {
  const cart = useAppStore((store) => store.cart);
  const incrementCartItem = useAppStore((store) => store.incrementCartItem);
  const decrementCartItem = useAppStore((store) => store.decrementCartItem);
  const removeCartItem = useAppStore((store) => store.removeCartItem);
  const placeOrder = useAppStore((store) => store.placeOrder);
  const [address, setAddress] = useState('Saran Holding');
  const [submitting, setSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await placeOrder(address);
      Alert.alert('Sipariş onaylandı', 'Mock siparişin alındı. Gerçek ödeme alınmadı.');
    } catch (error) {
      Alert.alert('Sipariş tamamlanamadı', error instanceof Error ? error.message : 'Tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.title}>Sepetim</Text>
      <Text style={styles.subtitle}>{count} kalem</Text>

      <View style={styles.list}>
        {cart.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="cart-outline" size={34} color={theme.colors.subtle} />
            <Text style={styles.emptyTitle}>Sepetin boş</Text>
            <Text style={styles.emptyText}>Tarif detaylarından malzeme ekleyebilirsin.</Text>
          </View>
        ) : (
          cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.cartCopy}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemRecipe}>Tarif: {item.recipeTitle}</Text>
                <Text style={styles.itemMeta}>
                  {item.gram} gr • ₺{item.price.toFixed(2)} / adet
                </Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => decrementCartItem(item.id)} style={styles.qtyButton} activeOpacity={0.8}>
                  <Ionicons name="remove" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => incrementCartItem(item.id)} style={styles.qtyButton} activeOpacity={0.8}>
                  <Ionicons name="add" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeCartItem(item.id)} style={styles.deleteButton} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={19} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={styles.label}>Teslimat Adresi</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        multiline
        placeholder="Adres gir"
        placeholderTextColor={theme.colors.subtle}
        style={styles.address}
      />

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Toplam</Text>
        <Text style={styles.totalValue}>₺{total.toFixed(2)}</Text>
      </View>

      <AppButton
        title="Siparişi Onayla"
        icon="bag-check"
        onPress={handleConfirm}
        loading={submitting}
        disabled={cart.length === 0}
      />
      <Text style={styles.mockText}>* Mock ödeme - gerçek ödeme alınmaz.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    marginTop: 20,
    gap: 12,
  },
  cartItem: {
    minHeight: 82,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  cartCopy: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  itemRecipe: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  itemMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 16,
    textAlign: 'center',
    color: theme.colors.text,
    fontWeight: '900',
  },
  deleteButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 30,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  address: {
    minHeight: 64,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.text,
    textAlignVertical: 'top',
    fontWeight: '600',
  },
  totalCard: {
    marginTop: 16,
    marginBottom: 14,
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  totalValue: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 22,
  },
  mockText: {
    marginTop: 10,
    textAlign: 'center',
    color: theme.colors.subtle,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    minHeight: 160,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 4,
    color: theme.colors.muted,
    textAlign: 'center',
    fontSize: 13,
  },
});
