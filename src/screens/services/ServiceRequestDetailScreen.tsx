import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../../api/client';
import {
  acceptQuote,
  cancelServiceRequest,
  getServiceRequest,
  reviewServiceRequest,
  type ServiceRequestDetail,
} from '../../api/services';
import { Badge, Banner, Button, Card, Field, Loading } from '../../components/ui';
import { colors, formatPrice, radius, spacing, titleCase } from '../../theme';

export function ServiceRequestDetailScreen({ route, navigation }: any) {
  const { id } = route.params as { id: number };

  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyQuoteId, setBusyQuoteId] = useState<number | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getServiceRequest(id);
      setRequest(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this request.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept(quoteId: number) {
    setBusyQuoteId(quoteId);
    try {
      const updated = await acceptQuote(quoteId);
      setRequest(updated);
      setNotice('Quote accepted. The partner has been notified.');
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Could not accept that quote.');
    } finally {
      setBusyQuoteId(null);
    }
  }

  function confirmCancel() {
    Alert.alert('Cancel this request?', 'Partners will no longer be able to quote.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel request', style: 'destructive', onPress: handleCancel },
    ]);
  }

  async function handleCancel() {
    try {
      await cancelServiceRequest(id);
      navigation.goBack();
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Could not cancel this request.');
    }
  }

  async function handleReview() {
    setReviewing(true);
    try {
      await reviewServiceRequest(id, Number(rating), comment.trim() || undefined);
      setNotice('Thanks for your review.');
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Could not submit your review.');
    } finally {
      setReviewing(false);
    }
  }

  if (loading) return <Loading />;

  if (error || !request) {
    return (
      <View style={styles.errorWrap}>
        <Banner tone="error" message={error ?? 'Request not found.'} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {!!notice && <Banner tone="info" message={notice} />}

      <View style={styles.headerRow}>
        <Text style={styles.title}>{request.title}</Text>
        <Badge label={titleCase(request.status)} />
      </View>
      <Text style={styles.category}>{request.category?.name}</Text>
      {!!request.description && <Text style={styles.description}>{request.description}</Text>}

      {(request.budget_min || request.budget_max) && (
        <Text style={styles.budget}>
          Budget: {request.budget_min ? formatPrice(request.budget_min) : 'Any'} –{' '}
          {request.budget_max ? formatPrice(request.budget_max) : 'Any'}
        </Text>
      )}

      {['open', 'quoted'].includes(request.status) && (
        <Button title="Cancel request" variant="secondary" onPress={confirmCancel} />
      )}

      <Text style={styles.sectionTitle}>Quotes ({request.quotes?.length ?? 0})</Text>

      {(request.quotes ?? []).length === 0 ? (
        <Text style={styles.empty}>No quotes yet — partners typically respond within a day.</Text>
      ) : (
        request.quotes!.map((quote) => (
          <Card key={quote.id} style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <Text style={styles.partnerName}>{quote.partner?.name ?? 'Partner'}</Text>
              <Text style={styles.quoteAmount}>{formatPrice(quote.amount)}</Text>
            </View>
            {!!quote.message && <Text style={styles.quoteMessage}>{quote.message}</Text>}
            <Badge
              label={titleCase(quote.status)}
              tone={quote.status === 'accepted' ? 'success' : quote.status === 'rejected' ? 'danger' : 'neutral'}
            />
            {quote.status === 'pending' && request.status === 'quoted' && (
              <Button
                title="Accept this quote"
                onPress={() => handleAccept(quote.id)}
                loading={busyQuoteId === quote.id}
              />
            )}
          </Card>
        ))
      )}

      {request.status === 'accepted' && !!request.assigned_partner && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Assigned partner</Text>
          <Text style={styles.partnerName}>{request.assigned_partner.name}</Text>
          <Text style={styles.category}>{request.assigned_partner.phone}</Text>
        </Card>
      )}

      {request.status === 'completed' && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Rate this partner</Text>
          <Field label="Rating (1–5)" value={rating} onChangeText={setRating} keyboardType="number-pad" />
          <Field label="Comment (optional)" value={comment} onChangeText={setComment} multiline />
          <Button title="Submit review" onPress={handleReview} loading={reviewing} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  errorWrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 },
  category: { fontSize: 13, color: colors.muted },
  description: { fontSize: 14, color: colors.text, lineHeight: 20 },
  budget: { fontSize: 13, color: colors.muted },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  empty: { fontSize: 13, color: colors.muted },
  quoteCard: { gap: spacing.sm },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partnerName: { fontSize: 14, fontWeight: '600', color: colors.text },
  quoteAmount: { fontSize: 16, fontWeight: '700', color: colors.primary },
  quoteMessage: { fontSize: 13, color: colors.text },
  card: { gap: spacing.sm },
});
