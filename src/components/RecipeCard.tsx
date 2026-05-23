import { ComponentProps } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { Recipe } from '../types';

type IconName = ComponentProps<typeof Ionicons>['name'];

type RecipeCardProps = {
  recipe: Recipe;
  liked: boolean;
  onPress: () => void;
  onToggleLike: () => void;
  variant?: 'featured' | 'grid' | 'wide' | 'mini';
  style?: StyleProp<ViewStyle>;
};

export function RecipeCard({
  recipe,
  liked,
  onPress,
  onToggleLike,
  variant = 'wide',
  style,
}: RecipeCardProps) {
  if (variant === 'featured') {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.featured, pressed && styles.pressed, style]}>
        <ImageBackground source={{ uri: recipe.imageUrl }} imageStyle={styles.featuredImage} style={styles.featuredImageWrap}>
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.badge}>
              <Ionicons name="flame" size={13} color="#FFFFFF" />
              <Text style={styles.badgeText}>GÜNÜN TARİFİ</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>{recipe.title}</Text>
            <Text style={styles.featuredMeta} numberOfLines={1}>
              ❤ {recipe.likes} beğeni  •  {recipe.prepTime} dk  •  {recipe.category}
            </Text>
          </View>
        </ImageBackground>
      </Pressable>
    );
  }

  const isGrid = variant === 'grid';
  const isMini = variant === 'mini';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isGrid && styles.grid,
        isMini && styles.mini,
        pressed && styles.pressed,
        style,
      ]}
    >
      <ImageBackground
        source={{ uri: recipe.imageUrl }}
        imageStyle={[styles.cardImage, isMini && styles.miniImage]}
        style={[styles.cardImageWrap, isMini && styles.miniImageWrap]}
      >
        {!isMini ? (
          <TouchableOpacity onPress={onToggleLike} activeOpacity={0.85} style={styles.heartButton}>
            <Ionicons
              name={(liked ? 'heart' : 'heart-outline') as IconName}
              size={22}
              color={liked ? theme.colors.primary : theme.colors.text}
            />
          </TouchableOpacity>
        ) : null}
        {isGrid ? (
          <View style={styles.smallCategory}>
            <Text style={styles.smallCategoryText}>{recipe.category}</Text>
          </View>
        ) : null}
      </ImageBackground>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          ❤ {recipe.likes} {isMini ? '' : ` • ${recipe.prepTime} dk • ${recipe.difficulty}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.82,
  },
  featured: {
    height: 246,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadow,
  },
  featuredImageWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredImage: {
    borderRadius: theme.radius.lg,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.28)',
  },
  featuredContent: {
    padding: 20,
    gap: 7,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
  featuredMeta: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    borderRadius: theme.radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadow,
    shadowOpacity: 0.05,
  },
  grid: {
    width: '48%',
  },
  mini: {
    width: 146,
    shadowOpacity: 0.04,
  },
  cardImageWrap: {
    height: 168,
  },
  miniImageWrap: {
    height: 106,
  },
  cardImage: {
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
  },
  miniImage: {
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCategory: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallCategoryText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  cardMeta: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});
