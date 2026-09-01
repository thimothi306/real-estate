import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { deleteSavedSearch, getSavedSearches } from '../api/properties';
import type { SearchFilters } from '../api/types';
import { Banner, Button, EmptyState, Loading } from '../components/ui';
import { colors, radius, spacing, titleCase } from '../theme';

type SavedSearchItem = { id: number; name: string | null; filters: SearchFilters };

function describeFilters(filters: SearchFilters): string {
  const parts = [
    filters.city,
    filters.property_type && titleCase(filters.property_type),
    filters.listing_type === 'rent' ? 'For rent' : filters.listing_type === 'sale' ? 'For sale' : null,
    filters.min_price && `₹${filters.min_price.toLocaleString('en-IN')}+`,
    filters.max_price && `up to ₹${filters.max_price.toLocaleString('en-IN')}`,
    filters.bedrooms && `${filters.bedrooms} BHK`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'All properties';
}

export function SavedSearchesScreen({ navigation }: any) {
  const [items, setItems] = useState<SavedSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const result = await getSavedSearches();
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load saved searches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function confirmDelete(item: SavedSearchItem) {
    Alert.alert('Remove saved search', `Stop getting alerts for "${item.name ?? describeFilters(item.filters)}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setItems((current) => current.filter((search) => search.id !== item.id));
          try {
            await deleteSavedSearch(item.id);
          } catch {
            void load();
          }
        },
      },
    ]);
  }

  if (loading) return <Loading />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={error ? <Banner tone="error" message={error} /> : null}
      ListEmptyComponent={
        error ? null : (
          <EmptyState
            title="No saved searches"
            subtitle="Save a search from the Search tab to get notified when new matches are published."
          />
        )
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardBody}>
            <Text style={styles.name}>{item.name || 'Saved search'}</Text>
            <Text style={styles.filters}>{describeFilters(item.filters)}</Text>
          </View>
          <Button title="Remove" variant="secondary" onPress={() => confirmDelete(item)} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, flexGrow: 1, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardBody: { flex: 1, gap: 3 },
  name: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  filters: { fontSize: 12.5, color: colors.muted },
});
