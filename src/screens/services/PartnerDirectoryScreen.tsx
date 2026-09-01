import React, { useCallback, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getPartnerDirectory, type PartnerProfile } from '../../api/partners';
import { Badge, Banner, EmptyState, Loading } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';

export function PartnerDirectoryScreen({ route }: any) {
  const categorySlug = (route.params as { categorySlug?: string } | undefined)?.categorySlug;

  const [items, setItems] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getPartnerDirectory(categorySlug ? { category: categorySlug } : {});
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load partners.');
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading) return <Loading />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={error ? <Banner tone="error" message={error} /> : null}
      ListEmptyComponent={
        error ? null : <EmptyState title="No verified partners yet" subtitle="Check back soon, or post a request instead." />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.business_name}</Text>
            <Badge label="Verified" tone="success" />
          </View>
          {!!item.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
          <View style={styles.tagRow}>
            {(item.categories ?? []).map((cat) => (
              <Badge key={cat.id} label={cat.name} />
            ))}
          </View>
          {item.rating_count > 0 && (
            <Text style={styles.rating}>
              ★ {item.rating_avg?.toFixed(1)} ({item.rating_count} reviews) · {item.total_completed} completed
            </Text>
          )}
          {!!item.user?.phone && (
            <Pressable onPress={() => Linking.openURL(`tel:${item.user!.phone}`)}>
              <Text style={styles.call}>Call {item.user.name}</Text>
            </Pressable>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  bio: { fontSize: 13, color: colors.muted },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rating: { fontSize: 12.5, color: colors.muted },
  call: { fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 4 },
});
