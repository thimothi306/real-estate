import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getCommunityReviews } from '../api/insights';
import type { CommunityReviewSummary, Review, ReviewCategory } from '../api/types';
import { Banner, Button, EmptyState, Loading } from '../components/ui';
import { colors, radius, shadow, spacing } from '../theme';

const CATEGORY_META: Record<ReviewCategory, { label: string; icon: string; color: string }> = {
  water_supply: { label: 'Water Supply', icon: '💧', color: '#1a86c9' },
  internet: { label: 'Internet Quality', icon: '📶', color: '#6d3fc0' },
  traffic: { label: 'Traffic', icon: '🚦', color: '#a15c07' },
  safety: { label: 'Safety', icon: '🛡', color: '#17803d' },
  schools: { label: 'Schools', icon: '🎓', color: '#0e7a90' },
  hospitals: { label: 'Hospitals', icon: '🏥', color: '#b42318' },
  maintenance: { label: 'Maintenance', icon: '🧰', color: '#667085' },
};

/** Display order matches the mockup rather than whatever order SQL returns. */
const ORDER: ReviewCategory[] = ['water_supply', 'internet', 'traffic', 'safety', 'schools', 'hospitals', 'maintenance'];

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value) || 0;
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <Text style={styles.stars}>
      {'★'.repeat(rounded)}
      <Text style={styles.starsDim}>{'★'.repeat(Math.max(0, 5 - rounded))}</Text>
    </Text>
  );
}

export function CommunityReviewScreen({ route, navigation }: any) {
  const { city, locality } = route.params as { city: string; locality?: string };

  const [summary, setSummary] = useState<CommunityReviewSummary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getCommunityReviews(city, locality);
      setSummary(data.summary ?? []);
      setReviews(data.reviews ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load community reviews.');
    } finally {
      setLoading(false);
    }
  }, [city, locality]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loading />;

  const byCategory = new Map(summary.map((row) => [row.category, row]));
  const rated = summary.filter((row) => toNumber(row.avg_rating) > 0);
  const overall = rated.length
    ? rated.reduce((sum, row) => sum + toNumber(row.avg_rating), 0) / rated.length
    : 0;
  const totalReviews = summary.reduce((sum, row) => sum + row.total, 0);

  if (summary.length === 0) {
    return (
      <View style={styles.screen}>
        {!!error && (
          <View style={{ padding: spacing.lg }}>
            <Banner tone="error" message={error} />
          </View>
        )}
        <EmptyState
          icon="🏘"
          title="No reviews yet"
          subtitle={`Be the first to review ${locality ?? city}.`}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, shadow.sm]}>
        <Text style={styles.localityName}>{locality ?? city}</Text>
        <Text style={styles.overall}>{overall.toFixed(1)}</Text>
        <Stars rating={overall} />
        <Text style={styles.reviewCount}>({totalReviews} reviews)</Text>
        <Text style={styles.basedOn}>Based on real experiences from residents</Text>
      </View>

      <View style={[styles.card, shadow.sm]}>
        {ORDER.map((category, index) => {
          const row = byCategory.get(category);
          const meta = CATEGORY_META[category];
          const value = row ? toNumber(row.avg_rating) : 0;

          return (
            <View key={category} style={[styles.row, index < ORDER.length - 1 && styles.rowDivider]}>
              <View style={[styles.rowIcon, { backgroundColor: `${meta.color}1a` }]}>
                <Text style={{ fontSize: 15 }}>{meta.icon}</Text>
              </View>
              <Text style={styles.rowLabel}>{meta.label}</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{row ? value.toFixed(1) : '—'}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(value / 5) * 100}%`, backgroundColor: meta.color }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {reviews.length > 0 && (
        <View style={[styles.card, shadow.sm]}>
          <Text style={styles.sectionTitle}>What residents say</Text>
          {reviews.slice(0, 5).map((review) => (
            <View key={review.id} style={styles.comment}>
              <View style={styles.commentHead}>
                <Text style={styles.commentAuthor}>{review.user?.name ?? 'Resident'}</Text>
                <Text style={styles.commentCategory}>{CATEGORY_META[review.category]?.label}</Text>
              </View>
              <Stars rating={review.rating} />
              {!!review.comment && <Text style={styles.commentBody}>{review.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      <Button
        title="Write a Review"
        onPress={() => navigation.navigate('WriteReview', { city, locality })}
        style={{ marginTop: spacing.sm }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  hero: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: 2 },
  localityName: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  overall: { fontSize: 44, fontWeight: '900', color: colors.text, lineHeight: 50 },
  stars: { fontSize: 15, color: colors.gold, letterSpacing: 1 },
  starsDim: { color: colors.border },
  reviewCount: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  basedOn: { fontSize: 12, color: colors.faint, marginTop: spacing.sm, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  sectionTitle: { fontSize: 15.5, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  rowRight: { width: 96, gap: 4 },
  rowValue: { fontSize: 14, fontWeight: '800', color: colors.text, textAlign: 'right' },
  barTrack: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  comment: { paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: 4 },
  commentHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  commentCategory: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  commentBody: { fontSize: 13, color: colors.muted, lineHeight: 19 },
});
