import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getConversations } from '../../api/chat';
import type { Conversation } from '../../api/types';
import { Banner, EmptyState, Loading } from '../../components/ui';
import { colors, formatPrice, radius, shadow, spacing } from '../../theme';

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function ChatListScreen({ navigation }: any) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getConversations();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your chats.');
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
            icon="💬"
            title="No conversations yet"
            subtitle="Tap Contact Owner on any listing to start a chat."
          />
        )
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('ChatDetail', { conversationId: item.id, title: item.counterpart?.name })}
          style={({ pressed }) => [styles.row, shadow.sm, pressed && { opacity: 0.9 }]}
        >
          {item.property?.cover_image ? (
            <Image source={{ uri: item.property.cover_image }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbEmpty]}>
              <Text style={styles.thumbGlyph}>🏠</Text>
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.topLine}>
              <Text style={styles.name} numberOfLines={1}>
                {item.counterpart?.name ?? 'Owner'}
              </Text>
              <Text style={styles.time}>{relativeTime(item.last_message_at)}</Text>
            </View>

            <Text style={styles.property} numberOfLines={1}>
              {item.property?.title ?? 'Property'}
              {item.property ? ` · ${formatPrice(item.property.price)}` : ''}
            </Text>

            <View style={styles.bottomLine}>
              <Text style={[styles.preview, item.unread_count > 0 && styles.previewUnread]} numberOfLines={1}>
                {item.last_message ?? 'Say hello…'}
              </Text>
              {item.unread_count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread_count}</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, flexGrow: 1, gap: spacing.md },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  thumbGlyph: { fontSize: 22 },
  body: { flex: 1, gap: 3, justifyContent: 'center' },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  time: { fontSize: 11.5, color: colors.faint },
  property: { fontSize: 12, color: colors.muted },
  bottomLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  preview: { flex: 1, fontSize: 13, color: colors.muted },
  previewUnread: { color: colors.text, fontWeight: '600' },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
