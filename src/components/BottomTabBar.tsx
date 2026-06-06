import { ComponentProps, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { HomeQuickCreateAction, HomeQuickCreateMenu } from './HomeQuickCreateMenu';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabMeta: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  Home: { label: 'Ana Sayfa', icon: 'home-outline', activeIcon: 'home' },
  Explore: { label: 'Keşfet', icon: 'search-outline', activeIcon: 'search' },
  AddRecipe: { label: 'Paylaş', icon: 'add', activeIcon: 'add' },
  Cart: { label: 'Sepet', icon: 'cart-outline', activeIcon: 'cart' },
  Profile: { label: 'Profil', icon: 'person-outline', activeIcon: 'person' },
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const cartCount = useAppStore(
    (store) =>
      store.cart.reduce((sum, item) => sum + item.quantity, 0) +
      store.restaurantCart.reduce((sum, item) => sum + item.quantity, 0),
  );
  const rootNavigation = navigation.getParent();
  const quickActions: HomeQuickCreateAction[] = [
    {
      id: 'ingredient',
      title: 'Malzeme ekle',
      description: 'Dolabındaki ürünleri seçerek tarif eşleşmelerini güncelle.',
      icon: 'add-circle-outline',
      onPress: () => rootNavigation?.navigate('PantryVision'),
    },
    {
      id: 'recipe',
      title: 'Tarif oluştur',
      description: 'Toplulukla paylaşmak için yeni bir tarif hazırla.',
      icon: 'create-outline',
      onPress: () => navigation.navigate('AddRecipe'),
    },
    {
      id: 'camera',
      title: 'Fotoğrafla ürün tanı',
      description: 'Kamera demosuyla ürünlerini dolabına aktar.',
      icon: 'camera-outline',
      onPress: () => rootNavigation?.navigate('PantryVision'),
    },
    {
      id: 'shopping',
      title: 'Alışveriş listesi oluştur',
      description: 'Eksik ürünleri Akıllı Sepet planına dönüştür.',
      icon: 'basket-outline',
      onPress: () => rootNavigation?.navigate('SmartBasket'),
    },
    {
      id: 'chef',
      title: 'AI Şef’e sor',
      description: 'Bugün ne pişireceğine birlikte karar ver.',
      icon: 'sparkles-outline',
      onPress: () => rootNavigation?.navigate('AiChefChat'),
    },
  ];

  return (
    <>
      <View style={styles.wrap}>
        {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const meta = tabMeta[route.name];
        const options = descriptors[route.key].options;
        const accessibilityLabel =
          options.tabBarAccessibilityLabel ?? (route.name === 'AddRecipe' ? 'Tarif paylaş' : meta.label);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

          if (route.name === 'AddRecipe') {
            return (
              <Pressable
                key={route.key}
                onPress={() => setQuickMenuVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Hızlı aksiyon menüsünü aç"
                style={({ pressed }) => [styles.addSlot, pressed && styles.pressed]}
              >
                <View style={styles.addButton}>
                  <Ionicons name="add" size={34} color="#FFFFFF" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={accessibilityLabel}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <View>
                <Ionicons
                  name={isFocused ? meta.activeIcon : meta.icon}
                  size={24}
                  color={isFocused ? theme.colors.primary : theme.colors.subtle}
                />
                {route.name === 'Cart' && cartCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, isFocused && styles.activeLabel]} numberOfLines={1}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <HomeQuickCreateMenu
        visible={quickMenuVisible}
        onClose={() => setQuickMenuVisible(false)}
        actions={quickActions}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: Platform.OS === 'ios' ? 86 : 76,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.orangeShadow,
  },
  label: {
    fontSize: 11,
    color: theme.colors.subtle,
    fontWeight: '700',
  },
  activeLabel: {
    color: theme.colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});
