import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { Recipe } from '../../types';

type RecipeHeroProps = {
  recipe: Recipe;
  matchPercent: number;
  missingCount: number;
  liked: boolean;
  favoriteLoading?: boolean;
  safeTop: number;
  onBack: () => void;
  onToggleLike: () => void;
};

export function RecipeHero({
  recipe,
  matchPercent,
  missingCount,
  liked,
  favoriteLoading = false,
  safeTop,
  onBack,
  onToggleLike,
}: RecipeHeroProps) {
  const highlightTag =
    recipe.tags.find((tag) => ['pratik', 'fit', 'ekonomik', 'ustaisi'].includes(tag.toLocaleLowerCase('tr-TR'))) ??
    recipe.category;

  return (
    <ImageBackground
      source={{ uri: recipe.imageUrl }}
      style={styles.hero}
      imageStyle={styles.image}
    >
      <View style={styles.scrim} />
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel="Geri dön"
        style={[styles.iconButton, styles.backButton, { top: safeTop + 12 }]}
      >
        <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onToggleLike}
        disabled={favoriteLoading}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={liked ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        style={[styles.iconButton, styles.likeButton, { top: safeTop + 12 }]}
      >
        {favoriteLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? theme.colors.primary : theme.colors.text}
          />
        )}
      </TouchableOpacity>

      <View style={styles.badges}>
        <Badge icon="sparkles" text={`%${matchPercent} dolap uyumu`} primary />
        <Badge icon="time-outline" text={`${recipe.prepTime} dk`} />
        <Badge icon="speedometer-outline" text={recipe.difficulty} />
        <Badge icon="pricetag-outline" text={highlightTag} />
        <Badge
          icon={missingCount === 0 ? 'checkmark-circle-outline' : 'basket-outline'}
          text={missingCount === 0 ? 'Eksik yok' : `${missingCount} eksik ürün`}
          primary={missingCount > 0}
        />
      </View>
    </ImageBackground>
  );
}

function Badge({
  icon,
  text,
  primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  primary?: boolean;
}) {
  return (
    <View style={[styles.badge, primary && styles.primaryBadge]}>
      <Ionicons name={icon} size={13} color={primary ? '#FFFFFF' : theme.colors.text} />
      <Text style={[styles.badgeText, primary && styles.primaryBadgeText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    maxWidth: 920,
    height: 370,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.16)',
  },
  iconButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow,
    shadowOpacity: 0.1,
  },
  backButton: {
    left: 20,
  },
  likeButton: {
    right: 20,
  },
  badges: {
    padding: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    minHeight: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  primaryBadge: {
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  primaryBadgeText: {
    color: '#FFFFFF',
  },
});
