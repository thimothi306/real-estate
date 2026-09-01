import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ApiError } from '../../api/client';
import { getPropertyBookings, updateBookingStatus } from '../../api/properties';
import type { Booking } from '../../api/types';
import { Badge, Banner, Button, EmptyState, Loading } from '../../components/ui';
import { colors, radius, shadow, spacing, titleCase } from '../../theme';

const STATUS_TONE: Record<Booking['status'], 'neutral' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  blocked: 'neutral',
};

export function ManageBookingsScreen({ route }: any) {
  const { propertyId } = route.params as { propertyId: number; title?: string };

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getPropertyBookings(propertyId);
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load booking requests.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function respond(booking: Booking, status: 'confirmed' | 'cancelled') {
    setBusyId(booking.id);
    setError(null);
    try {
      await updateBookingStatus(booking.id, status);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update this booking.');
    } finally {
      setBusyId(null);
    }
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
            icon="📅"
            title="No booking requests yet"
            subtitle="Requests from guests will appear here for you to confirm or decline."
          />
        )
      }
      renderItem={({ item }) => (
        <View style={[styles.card, shadow.sm]}>
          <View style={styles.row}>
            <Text style={styles.dates}>
              {new Date(item.start_date).toLocaleDateString('en-IN')} – {new Date(item.end_date).toLocaleDateString('en-IN')}
            </Text>
            <Badge label={titleCase(item.status)} tone={STATUS_TONE[item.status]} />
          </View>
          {!!item.note && <Text style={styles.note}>“{item.note}”</Text>}

          {item.status === 'pending' && (
            <View style={styles.actions}>
              <Button
                title="Confirm"
                onPress={() => respond(item, 'confirmed')}
                loading={busyId === item.id}
                style={styles.actionButton}
              />
              <Button
                title="Decline"
                variant="secondary"
                onPress={() => respond(item, 'cancelled')}
                disabled={busyId === item.id}
                style={styles.actionButton}
              />
            </View>
          )}
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
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dates: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  note: { fontSize: 13, color: colors.muted, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButton: { flex: 1 },
});
