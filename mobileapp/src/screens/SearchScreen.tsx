import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../api/client';
import { getLifestyleTags, saveSearch, searchProperties } from '../api/properties';
import type { LifestyleTag, PropertySummary, SearchFilters } from '../api/types';
import { PropertyCard } from '../components/PropertyCard';
import { Banner, Button, EmptyState, Field, Loading } from '../components/ui';
import { colors, radius, spacing, titleCase } from '../theme';

const SORTS: { value: NonNullable<SearchFilters['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export function SearchScreen({ navigation, route }: any) {
  const initial = (route.params ?? {}) as SearchFilters & { heading?: string };

  const [filters, setFilters] = useState<SearchFilters>({
    property_type: initial.property_type,
    listing_type: initial.listing_type,
    sort: 'newest',
  });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PropertySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lifestyleTags, setLifestyleTags] = useState<LifestyleTag[]>([]);
  const [savingSearch, setSavingSearch] = useState(false);

  // Draft filter values, only applied when the sheet's Apply button is pressed.
  const [draft, setDraft] = useState<SearchFilters>(filters);

  useEffect(() => {
    getLifestyleTags()
      .then(setLifestyleTags)
      .catch(() => undefined);
  }, []);

  const runSearch = useCallback(
    async (activeFilters: SearchFilters, searchTerm: string, targetPage: number) => {
      const isFirstPage = targetPage === 1;
      isFirstPage ? setLoading(true) : setLoadingMore(true);
      setError(null);

      try {
        const result = await searchProperties({
          ...activeFilters,
          q: searchTerm.trim() || undefined,
          page: targetPage,
          per_page: 20,
        });

        setResults((current) => (isFirstPage ? result.items : [...current, ...result.items]));
        setTotal(result.total);
        setLastPage(result.lastPage);
        setPage(result.currentPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    void runSearch(filters, query, 1);
    // Re-runs when filters change; the query is applied via the search button.
  }, [filters, runSearch]);

  useEffect(() => {
    if (initial.heading) navigation.setOptions({ title: initial.heading });
  }, [initial.heading, navigation]);

  function applyDraft() {
    setFilters(draft);
    setFiltersOpen(false);
  }

  function clearFilters() {
    const cleared: SearchFilters = { sort: 'newest' };
    setDraft(cleared);
    setFilters(cleared);
    setFiltersOpen(false);
  }

  const activeFilterCount = [
    filters.city,
    filters.property_type,
    filters.listing_type,
    filters.min_price,
    filters.max_price,
    filters.bedrooms,
    filters.lifestyle_tag,
  ].filter(Boolean).length;

  async function handleSaveSearch() {
    setSavingSearch(true);

    try {
      await saveSearch('', { ...filters, q: query.trim() || undefined });
      Alert.alert('Search saved', "We'll notify you when a new matching property is published.");
    } catch (err) {
      Alert.alert('Could not save search', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setSavingSearch(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Field
              label=""
              value={query}
              onChangeText={setQuery}
              placeholder="Search listings…"
              returnKeyType="search"
              onSubmitEditing={() => runSearch(filters, query, 1)}
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterButton} onPress={() => { setDraft(filters); setFiltersOpen(true); }}>
            <Text style={styles.filterButtonText}>
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sortRow}>
          {SORTS.map((sort) => {
            const active = filters.sort === sort.value;
            return (
              <Pressable
                key={sort.value}
                onPress={() => setFilters((current) => ({ ...current, sort: sort.value }))}
                style={[styles.sortChip, active && styles.sortChipActive]}
              >
                <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{sort.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <Loading label="Searching…" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {!!error && <Banner tone="error" message={error} />}
              {!error && (
                <View style={styles.resultHeader}>
                  <Text style={styles.resultCount}>
                    {total} {total === 1 ? 'property' : 'properties'} found
                  </Text>
                  <Pressable onPress={handleSaveSearch} disabled={savingSearch}>
                    <Text style={styles.saveSearchLink}>{savingSearch ? 'Saving…' : '🔔 Save this search'}</Text>
                  </Pressable>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            error ? null : (
              <EmptyState
                title="No properties match"
                subtitle="Try widening your filters or searching a different city."
              />
            )
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => navigation.navigate('PropertyDetail', { slug: item.slug })}
            />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!loadingMore && page < lastPage) {
              void runSearch(filters, query, page + 1);
            }
          }}
          ListFooterComponent={loadingMore ? <Text style={styles.loadingMore}>Loading more…</Text> : null}
        />
      )}

      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Filters</Text>

            <Field
              label="City"
              value={draft.city ?? ''}
              onChangeText={(text) => setDraft((current) => ({ ...current, city: text || undefined }))}
              placeholder="e.g. Hyderabad"
            />

            <Text style={styles.groupLabel}>Listing type</Text>
            <View style={styles.chipRow}>
              {(['sale', 'rent'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      listing_type: current.listing_type === option ? undefined : option,
                    }))
                  }
                  style={[styles.chip, draft.listing_type === option && styles.chipActive]}
                >
                  <Text style={[styles.chipText, draft.listing_type === option && styles.chipTextActive]}>
                    {option === 'sale' ? 'For sale' : 'For rent'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.groupLabel}>Property type</Text>
            <View style={styles.chipRow}>
              {(['apartment', 'villa', 'plot', 'farmhouse', 'resort', 'wedding_venue', 'hostel', 'pg', 'commercial', 'office_space', 'shop', 'warehouse'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      property_type: current.property_type === option ? undefined : option,
                    }))
                  }
                  style={[styles.chip, draft.property_type === option && styles.chipActive]}
                >
                  <Text style={[styles.chipText, draft.property_type === option && styles.chipTextActive]}>
                    {titleCase(option)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {lifestyleTags.length > 0 && (
              <>
                <Text style={styles.groupLabel}>Lifestyle</Text>
                <View style={styles.chipRow}>
                  {lifestyleTags.map((tag) => (
                    <Pressable
                      key={tag.id}
                      onPress={() =>
                        setDraft((current) => ({
                          ...current,
                          lifestyle_tag: current.lifestyle_tag === tag.slug ? undefined : tag.slug,
                        }))
                      }
                      style={[styles.chip, draft.lifestyle_tag === tag.slug && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, draft.lifestyle_tag === tag.slug && styles.chipTextActive]}>
                        {tag.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <View style={styles.priceRow}>
              <View style={styles.priceField}>
                <Field
                  label="Min price (₹)"
                  value={draft.min_price ? String(draft.min_price) : ''}
                  onChangeText={(text) =>
                    setDraft((current) => ({ ...current, min_price: text ? Number(text.replace(/\D/g, '')) : undefined }))
                  }
                  keyboardType="number-pad"
                  placeholder="0"
                />
              </View>
              <View style={styles.priceField}>
                <Field
                  label="Max price (₹)"
                  value={draft.max_price ? String(draft.max_price) : ''}
                  onChangeText={(text) =>
                    setDraft((current) => ({ ...current, max_price: text ? Number(text.replace(/\D/g, '')) : undefined }))
                  }
                  keyboardType="number-pad"
                  placeholder="Any"
                />
              </View>
            </View>

            <Text style={styles.groupLabel}>Bedrooms</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map((count) => (
                <Pressable
                  key={count}
                  onPress={() =>
                    setDraft((current) => ({ ...current, bedrooms: current.bedrooms === count ? undefined : count }))
                  }
                  style={[styles.chip, draft.bedrooms === count && styles.chipActive]}
                >
                  <Text style={[styles.chipText, draft.bedrooms === count && styles.chipTextActive]}>
                    {count} BHK
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Clear all" variant="secondary" onPress={clearFilters} style={{ flex: 1 }} />
              <Button title="Apply filters" onPress={applyDraft} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  toolbar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  searchRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  searchInputWrap: { flex: 1 },
  searchInput: { marginBottom: 0 },
  filterButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    height: 45,
    justifyContent: 'center',
  },
  filterButtonText: { fontSize: 13.5, fontWeight: '600', color: colors.text },
  sortRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.md },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#eef0f3',
  },
  sortChipActive: { backgroundColor: colors.primary },
  sortChipText: { fontSize: 12.5, color: colors.muted, fontWeight: '600' },
  sortChipTextActive: { color: '#fff' },
  list: { padding: spacing.lg, flexGrow: 1 },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultCount: { color: colors.muted, fontSize: 13 },
  saveSearchLink: { color: colors.primary, fontSize: 12.5, fontWeight: '600' },
  loadingMore: { textAlign: 'center', color: colors.muted, paddingVertical: spacing.lg },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    maxHeight: '88%',
  },
  modalTitle: { fontSize: 19, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  groupLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12.5, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  priceRow: { flexDirection: 'row', gap: spacing.md },
  priceField: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
