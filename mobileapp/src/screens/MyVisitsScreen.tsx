import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ApiError } from '../api/client';
import { cancelVisit, getMyVisits } from '../api/properties';
import type { Visit } from '../api/types';
import { Badge, Banner, EmptyState, Loading } from '../components/ui';
import { colors, radius, shadow, spacing, titleCase } from '../theme';

const STATUS_TONE: Record<Visit['status'], 'neutral' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'neutral',
  cancelled: 'danger',
  no_show: 'danger',
};

export function MyVisitsScreen({ navigation }: any) {
  const [items, setItems] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getMyVisits();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your visit requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function confirmCancel(visit: Visit) {
    Alert.alert('Cancel this visit?', 'The owner will be notified that you are no longer coming.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel visit', style: 'destructive', onPress: () => void handleCancel(visit) },
    ]);
  }

  async function handleCancel(visit: Visit) {
    setBusyId(visit.id);
    setError(null);
    try {
      await cancelVisit(visit.id);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel that visit.');
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
      ListHeaderComponent={error ? <Banner tone="error" message={error} /> : null}
      ListEmptyComponent={
        error ? null : (
          <EmptyState
            icon="📅"
            title="No visit requests yet"
            subtitle="Tap Schedule a Visit on any listing to book a site visit."
          />
        )
      }
      renderItem={({ item }) => {
        const when = new Date(item.scheduled_at);
        const upcoming = when.getTime() > Date.now();
        const canCancel = item.status === 'pending' || item.status === 'confirmed';

        return (
          <Pressable
            style={[styles.card, shadow.sm]}
            onPress={() =>
              item.property && navigation.navigate('PropertyDetail', { slug: item.property.slug })
            }
          >
            <View style={styles.dateBlock}>
              <Text style={styles.dateDay}>{when.getDate()}</Text>
              <Text style={styles.dateMonth}>{when.toLocaleDateString('en-IN', { month: 'short' })}</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.topRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.property?.title ?? 'Property'}
                </Text>
                <Badge label={titleCase(item.status)} tone={STATUS_TONE[item.status]} />
              </View>

              <Text style={styles.meta}>
                {when.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                {when.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
              </Text>

              {!!item.property?.city && <Text style={styles.city}>📍 {item.property.city}</Text>}
              {!!item.note && <Text style={styles.note}>“{item.note}”</Text>}

              {canCancel && upcoming && (
                <Pressable
                  onPress={() => confirmCancel(item)}
                  disabled={busyId === item.id}
                  hitSlop={6}
                  style={({ pressed }) => [styles.cancelLink, pressed && { opacity: 0.6 }]}
                >
                  <Text style={styles.cancelText}>
                    {busyId === item.id ? 'Cancelling…' : 'Cancel visit'}
                  </Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, flexGrow: 1, gap: spacing.md },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  dateBlock: {
    width: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  dateDay: { fontSize: 20, fontWeight: '800', color: colors.primary, lineHeight: 24 },
  dateMonth: { fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  body: { flex: 1, gap: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.text, fontWeight: '600' },
  city: { fontSize: 12, color: colors.muted },
  note: { fontSize: 12.5, color: colors.muted, fontStyle: 'italic', marginTop: 2 },
  cancelLink: { marginTop: 6, alignSelf: 'flex-start' },
  cancelText: { fontSize: 12.5, fontWeight: '700', color: colors.danger },
});
