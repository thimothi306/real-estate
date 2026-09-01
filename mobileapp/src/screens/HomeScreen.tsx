import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getRecentlyViewed, searchProperties } from '../api/properties';
import type { PropertySummary, PropertyType } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { Banner, IconChip, Loading, SectionHeader } from '../components/ui';
import { accents, colors, radius, shadow, spacing, type } from '../theme';

/** Primary categories — the five most-used, with More opening full search. */
const CATEGORIES: { label: string; icon: string; type?: PropertyType; listing?: 'sale' | 'rent' }[] = [
  { label: 'Buy', icon: '🏠', listing: 'sale' },
  { label: 'Rent', icon: '🏢', listing: 'rent' },
  { label: 'Plots', icon: '🏗', type: 'plot' },
  { label: 'Commercial', icon: '🏬', type: 'commercial' },
];

/** Lifestyle-first discovery — the differentiator over budget-only search. */
const LIFESTYLES: { label: string; icon: string; slug: string }[] = [
  { label: 'Family Friendly', icon: '👨‍👩‍👧', slug: 'family-friendly' },
  { label: 'Pet Friendly', icon: '🐾', slug: 'pet-friendly' },
  { label: 'Luxury Living', icon: '💎', slug: 'luxury-living' },
  { label: 'Weekend Home', icon: '🌴', slug: 'weekend-home' },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [latest, setLatest] = useState<PropertySummary[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const result = await searchProperties({ per_page: 8, sort: 'newest' });
      setLatest(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load listings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    // Best-effort — a signed-in-but-no-history user just won't see the section.
    getRecentlyViewed()
      .then(setRecentlyViewed)
      .catch(() => undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading) return <Loading label="Loading listings…" />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.greeting}>
        {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
      </Text>
      <Text style={styles.prompt}>Let's find your perfect property</Text>

      <Pressable
        style={({ pressed }) => [styles.searchBar, shadow.sm, pressed && { opacity: 0.9 }]}
        onPress={() => navigation.navigate('Search', {})}
      >
        <Text style={styles.searchBarIcon}>🔍</Text>
        <Text style={styles.searchBarText}>Search by location, project or lifestyle</Text>
      </Pressable>

      {!!error && <Banner tone="error" message={error} />}

      <View style={styles.categoryRow}>
        {CATEGORIES.map((category, index) => {
          const accent = accents[index % accents.length];
          return (
            <Pressable
              key={category.label}
              style={({ pressed }) => [styles.categoryTile, pressed && { opacity: 0.8 }]}
              onPress={() =>
                navigation.navigate('Search', {
                  property_type: category.type,
                  listing_type: category.listing,
                  heading: category.label,
                })
              }
            >
              <IconChip glyph={category.icon} bg={accent.bg} size={46} />
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          style={({ pressed }) => [styles.categoryTile, pressed && { opacity: 0.8 }]}
          onPress={() => navigation.navigate('Search', {})}
        >
          <IconChip glyph="•••" bg={colors.surfaceAlt} size={46} />
          <Text style={styles.categoryLabel}>More</Text>
        </Pressable>
      </View>

      <SectionHeader
        title="Lifestyle Search"
        actionLabel="See All"
        onAction={() => navigation.navigate('Search', {})}
      />
      <View style={styles.lifestyleRow}>
        {LIFESTYLES.map((lifestyle, index) => {
          const accent = accents[(index + 1) % accents.length];
          return (
            <Pressable
              key={lifestyle.slug}
              style={({ pressed }) => [styles.lifestyleTile, shadow.sm, pressed && { opacity: 0.85 }]}
              onPress={() =>
                navigation.navigate('Search', { lifestyle_tag: lifestyle.slug, heading: lifestyle.label })
              }
            >
              <View style={[styles.lifestyleIcon, { backgroundColor: accent.bg }]}>
                <Text style={{ fontSize: 20 }}>{lifestyle.icon}</Text>
              </View>
              <Text style={styles.lifestyleLabel} numberOfLines={2}>
                {lifestyle.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [styles.trustBanner, shadow.md, pressed && { opacity: 0.94 }]}
        onPress={() => navigation.navigate('Search', { rera_only: true, heading: 'Verified properties' })}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.trustTitle}>Verified Properties</Text>
          <Text style={styles.trustTitle}>You Can Trust</Text>
          <Text style={styles.trustSub}>Explore Now →</Text>
        </View>
        <Text style={styles.trustShield}>🛡</Text>
      </Pressable>

      {recentlyViewed.length > 0 && (
        <>
          <SectionHeader title="Recently viewed" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentRow}>
            {recentlyViewed.map((property) => (
              <Pressable
                key={property.id}
                style={[styles.recentCard, shadow.sm]}
                onPress={() => navigation.navigate('PropertyDetail', { slug: property.slug })}
              >
                <Text style={styles.recentTitle} numberOfLines={2}>
                  {property.title}
                </Text>
                <Text style={styles.recentCity}>📍 {property.city}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      <SectionHeader
        title="Nearby Properties"
        actionLabel="See All"
        onAction={() => navigation.navigate('Search', {})}
      />

      {latest.length === 0 ? (
        <Text style={styles.empty}>No published listings yet.</Text>
      ) : (
        latest.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onPress={() => navigation.navigate('PropertyDetail', { slug: property.slug })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { ...type.h1, color: colors.text },
  prompt: { fontSize: 13.5, color: colors.muted, marginTop: 3, marginBottom: spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  searchBarIcon: { fontSize: 14 },
  searchBarText: { color: colors.muted, fontSize: 13.5 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  categoryTile: { alignItems: 'center', gap: 7, width: '19%' },
  categoryLabel: { fontSize: 11, color: colors.text, fontWeight: '700', textAlign: 'center' },
  lifestyleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  lifestyleTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 7,
  },
  lifestyleIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  lifestyleLabel: { fontSize: 10.5, color: colors.text, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  trustTitle: { color: '#fff', fontSize: 16.5, fontWeight: '800', lineHeight: 22 },
  trustSub: { color: colors.gold, fontSize: 12.5, fontWeight: '700', marginTop: 8 },
  trustShield: { fontSize: 40 },
  empty: { color: colors.muted, fontSize: 13.5, paddingVertical: spacing.lg, textAlign: 'center' },
  recentRow: { marginBottom: spacing.xl },
  recentCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    gap: 4,
  },
  recentTitle: { fontSize: 12.5, fontWeight: '700', color: colors.text },
  recentCity: { fontSize: 11, color: colors.muted },
});
