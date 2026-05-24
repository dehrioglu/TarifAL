import { ComponentProps, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { InvestorConversionStrip } from '../../components/InvestorConversionStrip';
import { Screen } from '../../components/Screen';
import { familyQuickProducts } from '../../data/demoFamily';
import { theme } from '../../constants/theme';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyAccount'>;
type IconName = ComponentProps<typeof Ionicons>['name'];

export function FamilyAccountScreen({ navigation }: Props) {
  const familyAccount = useAppStore((store) => store.familyAccount);
  const addFamilyShoppingItem = useAppStore((store) => store.addFamilyShoppingItem);
  const toggleFamilyShoppingItem = useAppStore((store) => store.toggleFamilyShoppingItem);
  const removeFamilyShoppingItem = useAppStore((store) => store.removeFamilyShoppingItem);
  const addFamilyListToCart = useAppStore((store) => store.addFamilyListToCart);
  const [productName, setProductName] = useState('');

  const checkedItems = familyAccount.shoppingItems.filter((item) => item.checked);
  const checkedTotal = checkedItems.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const activeMembers = familyAccount.members.length;
  const categoryCount = useMemo(
    () => new Set(familyAccount.shoppingItems.map((item) => item.category)).size,
    [familyAccount.shoppingItems],
  );

  const addQuickProduct = (product: (typeof familyQuickProducts)[number]) => {
    addFamilyShoppingItem({
      name: product.name,
      quantity: 1,
      unit: product.unit,
      estimatedPrice: product.price,
      category: product.category,
      addedBy: 'Sen',
      note: 'Hızlı ekleme',
    });
  };

  const addManualProduct = () => {
    const value = productName.trim();

    if (!value) {
      return;
    }

    addFamilyShoppingItem({
      name: value,
      quantity: 1,
      unit: 'adet',
      estimatedPrice: 45,
      category: 'Ortak liste',
      addedBy: 'Sen',
      note: 'Manuel eklendi',
    });
    setProductName('');
  };

  const handleAddToCart = () => {
    if (checkedItems.length === 0) {
      Alert.alert('Ürün seç', 'Sepete aktarmak için ortak listeden en az bir ürün seç.');
      return;
    }

    addFamilyListToCart();
    Alert.alert('Sepet güncellendi', `${checkedItems.length} ortak liste ürünü market sepetine aktarıldı.`, [
      { text: 'Listede Kal', style: 'cancel' },
      { text: 'Sepete Git', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.86} style={styles.backButton}>
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ev Hesabı</Text>
        <View style={styles.backGhost} />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.eyebrow}>Ortak mutfak listesi</Text>
            <Text style={styles.heroTitle}>{familyAccount.homeName}</Text>
          </View>
          <View style={styles.inviteBadge}>
            <Text style={styles.inviteText}>{familyAccount.inviteCode}</Text>
          </View>
        </View>
        <Text style={styles.heroText}>
          Aynı evdeki herkes eksik ürünleri ekler; TarifAL tekrar edenleri birleştirip tek market sepetine dönüştürür.
        </Text>
        <View style={styles.memberRow}>
          {familyAccount.members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                <Text style={styles.memberInitial}>{member.initials}</Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeMembers}</Text>
          <Text style={styles.statLabel}>Ev üyesi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{familyAccount.shoppingItems.length}</Text>
          <Text style={styles.statLabel}>Ortak ürün</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{categoryCount}</Text>
          <Text style={styles.statLabel}>Kategori</Text>
        </View>
      </View>

      <View style={styles.addCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.sectionTitle}>Listeye ürün ekle</Text>
            <Text style={styles.sectionSubtitle}>Hızlı ekle veya elle yaz.</Text>
          </View>
          <View style={styles.iconWrap}>
            <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
          </View>
        </View>
        <View style={styles.quickGrid}>
          {familyQuickProducts.map((product) => (
            <TouchableOpacity
              key={product.name}
              onPress={() => addQuickProduct(product)}
              activeOpacity={0.86}
              style={styles.quickChip}
            >
              <Text style={styles.quickChipText}>{product.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            onSubmitEditing={addManualProduct}
            placeholder="Örn: limon, deterjan, kahve..."
            placeholderTextColor={theme.colors.subtle}
            style={styles.input}
          />
          <TouchableOpacity onPress={addManualProduct} activeOpacity={0.86} style={styles.addButton}>
            <Ionicons name="add" size={21} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.sectionTitle}>Ortak alışveriş listesi</Text>
            <Text style={styles.sectionSubtitle}>{checkedItems.length} ürün seçili • Tahmini ₺{checkedTotal}</Text>
          </View>
          <View style={styles.iconWrap}>
            <Ionicons name="people-outline" size={21} color={theme.colors.primary} />
          </View>
        </View>
        <View style={styles.items}>
          {familyAccount.shoppingItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <TouchableOpacity onPress={() => toggleFamilyShoppingItem(item.id)} activeOpacity={0.85}>
                <Ionicons
                  name={item.checked ? 'checkbox' : 'square-outline'}
                  size={23}
                  color={item.checked ? theme.colors.primary : theme.colors.subtle}
                />
              </TouchableOpacity>
              <View style={styles.itemCopy}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} {item.unit} • {item.addedBy} ekledi • {item.note}
                </Text>
              </View>
              <Text style={styles.itemPrice}>₺{item.estimatedPrice}</Text>
              <TouchableOpacity onPress={() => removeFamilyShoppingItem(item.id)} activeOpacity={0.85} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={handleAddToCart} activeOpacity={0.88} style={styles.primaryButton}>
          <Ionicons name="cart" size={17} color="#FFFFFF" />
          <Text style={styles.primaryText}>Seçilenleri Sepete Aktar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityCard}>
        <Text style={styles.sectionTitle}>Ev içi aktiviteler</Text>
        <View style={styles.activities}>
          {familyAccount.activities.map((activity) => (
            <View key={activity.id} style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon as IconName} size={17} color={theme.colors.primary} />
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityText}>{activity.actor}: {activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <InvestorConversionStrip compact />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingTop: 12,
  },
  topBar: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGhost: {
    width: 42,
    height: 42,
  },
  topTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 18,
    gap: 14,
    ...theme.orangeShadow,
    shadowOpacity: 0.08,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  heroTitle: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 27,
    fontWeight: '900',
  },
  inviteBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inviteText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  heroText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
  memberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  memberItem: {
    width: '48%',
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 11,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  memberName: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  memberRole: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  stats: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minHeight: 72,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'center',
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  addCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 13,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  listCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 13,
    ...theme.shadow,
    shadowOpacity: 0.04,
  },
  activityCard: {
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 13,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  quickChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 15,
    color: theme.colors.text,
    fontWeight: '800',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  items: {
    gap: 9,
  },
  itemRow: {
    minHeight: 66,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  itemMeta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  itemPrice: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  removeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.orangeShadow,
    shadowOpacity: 0.12,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  activities: {
    gap: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
  },
  activityText: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  activityTime: {
    marginTop: 2,
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '700',
  },
});
