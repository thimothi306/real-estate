import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getMyServiceRequests, type ServiceRequestSummary } from '../../api/services';
import { Badge, Banner, EmptyState, Loading } from '../../components/ui';
import { colors, radius, spacing, titleCase } from '../../theme';

const STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  open: 'neutral',
  quoted: 'warning',
  accepted: 'success',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export function MyServiceRequestsScreen({ navigation }: any) {
  const [items, setItems] = useState<ServiceRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getMyServiceRequests();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your requests.');
    } finally {
      setLoading(false);
    }
  }, []);

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
        error ? null : <EmptyState title="No requests yet" subtitle="Post a request from the Services tab." />
      }
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('ServiceRequestDetail', { id: item.id })}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Badge label={titleCase(item.status)} tone={STATUS_TONE[item.status] ?? 'neutral'} />
          </View>
          <Text style={styles.category}>{item.category?.name}</Text>
          {!!item.quotes_count && <Text style={styles.meta}>{item.quotes_count} quote(s) received</Text>}
        </Pressable>
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
    gap: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 14.5, fontWeight: '600', color: colors.text, flex: 1 },
  category: { fontSize: 12.5, color: colors.muted },
  meta: { fontSize: 12, color: colors.primary },
});
