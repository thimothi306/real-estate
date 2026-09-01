import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PropertySummary } from '../api/types';
import { colors, formatPrice, radius, shadow, spacing, titleCase } from '../theme';
import { Badge } from './ui';

type Props = {
  property: PropertySummary;
  onPress: () => void;
  /** Owner listings show their moderation status; public results don't. */
  showStatus?: boolean;
};

const STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  published: 'success',
  pending_review: 'warning',
  draft: 'neutral',
  rejected: 'danger',
  archived: 'danger',
  sold: 'neutral',
  rented: 'neutral',
};

const TYPE_GLYPH: Record<string, string> = {
  apartment: '🏢',
  villa: '🏡',
  plot: '🏗',
  farmhouse: '🌴',
  resort: '🏨',
  pg: '🛏',
  hostel: '🏫',
  commercial: '🏬',
  office_space: '🏬',
  shop: '🛍',
  warehouse: '📦',
  wedding_venue: '💒',
};

export function PropertyCard({ property, onPress, showStatus }: Props) {
  const specs = [
    property.bedrooms ? `${property.bedrooms} BHK` : null,
    property.bathrooms ? `${property.bathrooms} Bath` : null,
    property.area_sqft ? `${Math.round(property.area_sqft)} sq ft` : null,
  ].filter(Boolean);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, shadow.sm, pressed && styles.pressed]}>
      <View>
        {property.cover_image ? (
          <Image source={{ uri: property.cover_image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Text style={styles.imageFallbackGlyph}>{TYPE_GLYPH[property.property_type] ?? '🏠'}</Text>
            <Text style={styles.imageFallbackText}>{titleCase(property.property_type)}</Text>
          </View>
        )}

        <View style={styles.priceChip}>
          <Text style={styles.priceChipText}>{formatPrice(property.price)}</Text>
        </View>

        {property.is_featured && (
          <View style={styles.featuredChip}>
            <Text style={styles.featuredChipText}>★ Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {property.title}
          </Text>
          {showStatus && property.status && (
            <Badge label={titleCase(property.status)} tone={STATUS_TONE[property.status] ?? 'neutral'} />
          )}
        </View>

        <Text style={styles.location} numberOfLines={1}>
          📍 {[property.locality, property.city].filter(Boolean).join(', ')}
        </Text>

        {specs.length > 0 && <Text style={styles.specs}>{specs.join('   ·   ')}</Text>}

        <View style={styles.tags}>
          <Badge label={titleCase(property.property_type)} tone="primary" />
          <Badge label={property.listing_type === 'rent' ? 'For Rent' : 'For Sale'} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  pressed: { opacity: 0.93 },
  image: { width: '100%', height: 190, backgroundColor: colors.surfaceAlt },
  imageFallback: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  imageFallbackGlyph: { fontSize: 34 },
  imageFallbackText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  priceChip: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    backgroundColor: 'rgba(15, 20, 30, 0.72)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  priceChipText: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  featuredChip: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  featuredChipText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  body: { padding: spacing.lg, gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontSize: 15.5, fontWeight: '700', color: colors.text, flex: 1, lineHeight: 20 },
  location: { fontSize: 13, color: colors.muted },
  specs: { fontSize: 12.5, color: colors.muted, fontWeight: '500' },
  tags: { flexDirection: 'row', gap: 6, marginTop: 6 },
});
