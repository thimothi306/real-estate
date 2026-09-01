import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/properties';
import type { AppNotification } from '../api/types';
import { Banner, Button, EmptyState, Loading } from '../components/ui';
import { colors, spacing } from '../theme';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsScreen({ navigation }: any) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const result = await getNotifications();
      setItems(result.items);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load notifications.');
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

  async function handlePress(notification: AppNotification) {
    if (!notification.read_at) {
      setItems((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      void markNotificationRead(notification.id).catch(() => undefined);
    }

    if (notification.data.property_slug) {
      navigation.navigate('PropertyDetail', { slug: notification.data.property_slug });
    }
  }

  async function handleMarkAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      void load();
    }
  }

  if (loading) return <Loading />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
        />
      }
      ListHeaderComponent={
        <>
          {!!error && <Banner tone="error" message={error} />}
          {unreadCount > 0 && (
            <Button title={`Mark all ${unreadCount} as read`} variant="secondary" onPress={handleMarkAllRead} />
          )}
        </>
      }
      ListEmptyComponent={
        error ? null : <EmptyState title="No notifications yet" subtitle="We'll let you know when something changes." />
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => handlePress(item)}
          style={[styles.row, !item.read_at && styles.rowUnread]}
        >
          {!item.read_at && <View style={styles.dot} />}
          <View style={styles.rowBody}>
            <Text style={styles.message}>{item.data.message}</Text>
            <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, flexGrow: 1, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
  },
  rowUnread: { backgroundColor: '#eaf1fd', borderColor: '#c9dcf7' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 5 },
  rowBody: { flex: 1, gap: 2 },
  message: { fontSize: 14, color: colors.text },
  time: { fontSize: 12, color: colors.muted },
});
