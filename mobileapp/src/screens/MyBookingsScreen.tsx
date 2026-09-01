import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getMyBookings } from '../api/properties';
import type { Booking } from '../api/types';
import { Badge, Banner, EmptyState, Loading } from '../components/ui';
import { colors, radius, spacing, titleCase } from '../theme';

const STATUS_TONE: Record<Booking['status'], 'neutral' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  blocked: 'neutral',
};

export function MyBookingsScreen() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const result = await getMyBookings();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your bookings.');
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
        error ? null : <EmptyState title="No bookings yet" subtitle="Request a booking from a bookable property's page." />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.property?.title ?? 'Property'}</Text>
            <Badge label={titleCase(item.status)} tone={STATUS_TONE[item.status]} />
          </View>
          <Text style={styles.dates}>
            {new Date(item.start_date).toLocaleDateString('en-IN')} – {new Date(item.end_date).toLocaleDateString('en-IN')}
          </Text>
          {!!item.property?.city && <Text style={styles.city}>{item.property.city}</Text>}
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
    gap: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14.5, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
  dates: { fontSize: 13, color: colors.text },
  city: { fontSize: 12.5, color: colors.muted },
});
