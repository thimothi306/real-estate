import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ApiError } from '../../api/client';
import { getConversation, sendMessage } from '../../api/chat';
import type { Conversation, Message } from '../../api/types';
import { Banner, Loading } from '../../components/ui';
import { colors, formatPrice, radius, shadow, spacing } from '../../theme';

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function ChatDetailScreen({ route, navigation }: any) {
  const { conversationId } = route.params as { conversationId: number; title?: string };

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getConversation(conversationId);
      setConversation(data);
      setMessages(data.messages ?? []);
      if (data.counterpart?.name) navigation.setOptions({ title: data.counterpart.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open this chat.');
    } finally {
      setLoading(false);
    }
  }, [conversationId, navigation]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);

    try {
      const message = await sendMessage(conversationId, body);
      setMessages((current) => [...current, message]);
      setDraft('');
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {!!conversation?.property && (
        <Pressable
          style={[styles.propertyBar, shadow.sm]}
          onPress={() => navigation.navigate('PropertyDetail', { slug: conversation.property!.slug })}
        >
          {conversation.property.cover_image ? (
            <Image source={{ uri: conversation.property.cover_image }} style={styles.propertyThumb} />
          ) : (
            <View style={[styles.propertyThumb, styles.thumbEmpty]}>
              <Text>🏠</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {conversation.property.title}
            </Text>
            <Text style={styles.propertyPrice}>{formatPrice(conversation.property.price)}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}

      {!!error && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
          <Banner tone="error" message={error} />
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet — say hello.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.is_mine ? styles.rowMine : styles.rowTheirs]}>
            <View style={[styles.bubble, item.is_mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={item.is_mine ? styles.textMine : styles.textTheirs}>{item.body}</Text>
              <Text style={[styles.time, item.is_mine ? styles.timeMine : styles.timeTheirs]}>
                {clockTime(item.created_at)}
              </Text>
            </View>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message…"
          placeholderTextColor={colors.faint}
          style={styles.input}
          multiline
          maxLength={2000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim() || sending}
          style={({ pressed }) => [
            styles.sendButton,
            (!draft.trim() || sending) && { opacity: 0.45 },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  propertyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: radius.md,
  },
  propertyThumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  propertyTitle: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  propertyPrice: { fontSize: 12.5, color: colors.muted, marginTop: 1 },
  chevron: { fontSize: 22, color: colors.faint },
  messages: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 13.5, marginTop: spacing.xxl },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.md },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  textMine: { color: '#fff', fontSize: 14.5, lineHeight: 20 },
  textTheirs: { color: colors.text, fontSize: 14.5, lineHeight: 20 },
  time: { fontSize: 10.5, marginTop: 4, alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(255,255,255,0.7)' },
  timeTheirs: { color: colors.faint },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14.5,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { color: '#fff', fontSize: 16 },
});
