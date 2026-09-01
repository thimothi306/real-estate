import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ApiError } from '../../api/client';
import { getServiceQueue, submitQuote, type ServiceRequestSummary } from '../../api/services';
import { Banner, Button, EmptyState, Field, Loading } from '../../components/ui';
import { colors, formatPrice, radius, spacing } from '../../theme';

export function ServiceQueueScreen() {
  const [items, setItems] = useState<ServiceRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [quoting, setQuoting] = useState<ServiceRequestSummary | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await getServiceQueue();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the request queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function openQuoteModal(item: ServiceRequestSummary) {
    setQuoting(item);
    setAmount('');
    setMessage('');
  }

  async function handleSubmitQuote() {
    if (!quoting) return;

    setSaving(true);
    try {
      await submitQuote(quoting.id, Number(amount.replace(/\D/g, '')) || 0, message.trim() || undefined);
      setNotice('Quote sent.');
      setQuoting(null);
      void load();
    } catch (err) {
      Alert.alert('Could not submit quote', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            {!!error && <Banner tone="error" message={error} />}
            {!!notice && <Banner tone="success" message={notice} />}
          </>
        }
        ListEmptyComponent={
          error ? null : <EmptyState title="No open requests" subtitle="New requests in your categories will show up here." />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.category}>{item.category?.name}</Text>
            {!!item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            {(item.budget_min || item.budget_max) && (
              <Text style={styles.budget}>
                Budget: {item.budget_min ? formatPrice(item.budget_min) : 'Any'} –{' '}
                {item.budget_max ? formatPrice(item.budget_max) : 'Any'}
              </Text>
            )}
            <Button title="Send a quote" onPress={() => openQuoteModal(item)} />
          </View>
        )}
      />

      <Modal visible={!!quoting} animationType="slide" transparent onRequestClose={() => setQuoting(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Quote for &ldquo;{quoting?.title}&rdquo;</Text>
            <Field label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="3500" />
            <Field label="Message (optional)" value={message} onChangeText={setMessage} multiline placeholder="What's included, timeline, etc." />
            <View style={styles.actions}>
              <Button title="Cancel" variant="secondary" onPress={() => setQuoting(null)} style={{ flex: 1 }} />
              <Button title="Send quote" onPress={handleSubmitQuote} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  title: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  category: { fontSize: 12.5, color: colors.primary },
  description: { fontSize: 13, color: colors.muted },
  budget: { fontSize: 12.5, color: colors.muted, marginBottom: spacing.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md },
});
