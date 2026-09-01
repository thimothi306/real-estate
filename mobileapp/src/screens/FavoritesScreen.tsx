import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getFavorites } from '../api/properties';
import type { PropertySummary } from '../api/types';
import { PropertyCard } from '../components/PropertyCard';
import { Banner, Button, EmptyState, Loading } from '../components/ui';
import { colors, radius, spacing } from '../theme';

const MAX_COMPARE = 4;

export function FavoritesScreen({ navigation }: any) {
  const [items, setItems] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    setError(null);

    try {
      const result = await getFavorites();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your saved properties.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh on focus so a property saved on the detail screen shows up here.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function toggleCompareMode() {
    setCompareMode((current) => !current);
    setSelectedIds([]);
  }

  function toggleSelected(id: number) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((i) => i !== id);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, id];
    });
  }

  if (loading) return <Loading />;

  return (
    <View style={styles.screen}>
      {items.length >= 2 && (
        <View style={styles.toolbar}>
          <Button
            title={compareMode ? 'Cancel' : 'Compare properties'}
            variant="secondary"
            onPress={toggleCompareMode}
          />
          {compareMode && (
            <Button
              title={`Compare (${selectedIds.length})`}
              disabled={selectedIds.length < 2}
              onPress={() => navigation.navigate('Compare', { propertyIds: selectedIds })}
            />
          )}
        </View>
      )}

      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        ListHeaderComponent={error ? <Banner tone="error" message={error} /> : null}
        ListEmptyComponent={
          error ? null : (
            <EmptyState
              title="Nothing saved yet"
              subtitle="Tap Save on any property to keep it here."
            />
          )
        }
        renderItem={({ item }) =>
          compareMode ? (
            <Pressable onPress={() => toggleSelected(item.id)} style={styles.selectableCard}>
              <View style={[styles.checkbox, selectedIds.includes(item.id) && styles.checkboxSelected]}>
                {selectedIds.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <PropertyCard property={item} onPress={() => toggleSelected(item.id)} />
              </View>
            </Pressable>
          ) : (
            <PropertyCard
              property={item}
              onPress={() => navigation.navigate('PropertyDetail', { slug: item.slug })}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, flexGrow: 1 },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: 0,
  },
  selectableCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
