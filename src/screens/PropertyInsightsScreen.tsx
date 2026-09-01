import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getPropertyInsights } from '../api/insights';
import { getSimilarProperties } from '../api/properties';
import type { PropertyInsight, PropertySummary } from '../api/types';
import { PropertyCard } from '../components/PropertyCard';
import { Banner, EmptyState, Loading, SectionHeader } from '../components/ui';
import { colors, formatPrice, radius, shadow, spacing, titleCase } from '../theme';

/** Each tile's accent reflects whether the reading is good or something to note. */
const TONE = {
  good: { bg: colors.successBg, fg: colors.success },
  neutral: { bg: colors.infoBg, fg: colors.info },
  watch: { bg: colors.warningBg, fg: colors.warning },
};

function sunlightTone(rating: string | null) {
  return rating === 'excellent' || rating === 'good' ? TONE.good : TONE.watch;
}

function noiseTone(level: string | null) {
  return level === 'low' ? TONE.good : level === 'high' ? TONE.watch : TONE.neutral;
}

export function PropertyInsightsScreen({ route, navigation }: any) {
  const { propertyId, city, locality } = route.params as {
    propertyId: number;
    city?: string;
    locality?: string;
  };

  const [insight, setInsight] = useState<PropertyInsight | null>(null);
  const [similar, setSimilar] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setInsight(await getPropertyInsights(propertyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Insights are not available for this property.');
    } finally {
      setLoading(false);
    }

    // Non-critical — the screen still works without the similar-properties row.
    getSimilarProperties(propertyId)
      .then(setSimilar)
      .catch(() => undefined);
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loading />;

  if (!insight) {
    return (
      <View style={styles.screen}>
        {!!error && (
          <View style={{ padding: spacing.lg }}>
            <Banner tone="info" message={error} />
          </View>
        )}
        <EmptyState icon="📊" title="No insights yet" subtitle="We're still analysing this property." />
      </View>
    );
  }

  const tiles = [
    {
      icon: '☀️',
      label: 'Sunlight',
      value: titleCase(insight.sunlight_rating),
      caption: 'Analysis',
      tone: sunlightTone(insight.sunlight_rating),
    },
    {
      icon: '🔊',
      label: 'Noise',
      value: titleCase(insight.noise_level),
      caption: 'Analysis',
      tone: noiseTone(insight.noise_level),
    },
    {
      icon: '📍',
      label: 'Travel Time',
      value: insight.commute_minutes ? `${insight.commute_minutes} min` : '—',
      caption: insight.commute_landmark ? `to ${insight.commute_landmark}` : 'Commute',
      tone: TONE.neutral,
    },
    {
      icon: '📈',
      label: 'Investment Score',
      value: insight.investment_score != null ? `${insight.investment_score}/10` : '—',
      caption: (insight.investment_score ?? 0) >= 8 ? 'Great' : 'Moderate',
      tone: (insight.investment_score ?? 0) >= 8 ? TONE.good : TONE.neutral,
    },
    {
      icon: '💰',
      label: 'Rental Yield',
      value: insight.rental_yield_percent != null ? `${insight.rental_yield_percent}%` : '—',
      caption: 'Per annum',
      tone: TONE.good,
    },
    {
      icon: '🏗',
      label: 'Future Infra',
      value: insight.future_infrastructure ?? '—',
      caption: 'Planned',
      tone: TONE.neutral,
    },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <View key={tile.label} style={[styles.tile, shadow.sm]}>
            <View style={[styles.tileIcon, { backgroundColor: tile.tone.bg }]}>
              <Text style={{ fontSize: 18 }}>{tile.icon}</Text>
            </View>
            <Text style={styles.tileLabel}>{tile.label}</Text>
            <Text style={styles.tileValue} numberOfLines={2}>
              {tile.value}
            </Text>
            <Text style={[styles.tileCaption, { color: tile.tone.fg }]} numberOfLines={1}>
              {tile.caption}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.valuationCard, shadow.sm]}>
        <Text style={styles.valuationTitle}>Estimated valuation</Text>
        <View style={styles.valuationRow}>
          <View style={styles.valuationItem}>
            <Text style={styles.valuationLabel}>Market price</Text>
            <Text style={styles.valuationValue}>{formatPrice(insight.estimated_market_price)}</Text>
          </View>
          <View style={styles.valuationItem}>
            <Text style={styles.valuationLabel}>Monthly rent</Text>
            <Text style={styles.valuationValue}>{formatPrice(insight.estimated_rental_value)}</Text>
          </View>
        </View>
        <View style={styles.valuationRow}>
          <View style={styles.valuationItem}>
            <Text style={styles.valuationLabel}>Demand</Text>
            <Text style={styles.valuationValue}>{titleCase(insight.demand_level)}</Text>
          </View>
          <View style={styles.valuationItem}>
            <Text style={styles.valuationLabel}>Expected to sell in</Text>
            <Text style={styles.valuationValue}>
              {insight.expected_selling_days ? `${insight.expected_selling_days} days` : '—'}
            </Text>
          </View>
        </View>
      </View>

      {!!city && (
        <View style={[styles.communityCard, shadow.sm]}>
          <Text style={styles.valuationTitle}>Community reviews</Text>
          <Text style={styles.communityBody}>
            See what residents say about {locality ?? city} — water, traffic, safety, schools and more.
          </Text>
          <Text
            style={styles.communityLink}
            onPress={() => navigation.navigate('CommunityReview', { city, locality })}
          >
            View locality ratings →
          </Text>
        </View>
      )}

      {similar.length > 0 && (
        <>
          <SectionHeader title="Similar properties" />
          {similar.slice(0, 4).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPress={() => navigation.push('PropertyDetail', { slug: property.slug })}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  tile: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    alignItems: 'flex-start',
  },
  tileIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  tileLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  tileValue: { fontSize: 13, fontWeight: '800', color: colors.text },
  tileCaption: { fontSize: 10.5, fontWeight: '700' },
  valuationCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  valuationTitle: { fontSize: 15.5, fontWeight: '800', color: colors.text },
  valuationRow: { flexDirection: 'row', gap: spacing.md },
  valuationItem: { flex: 1, gap: 2 },
  valuationLabel: { fontSize: 11.5, color: colors.muted, fontWeight: '600' },
  valuationValue: { fontSize: 15, fontWeight: '700', color: colors.text },
  communityCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 6, marginBottom: spacing.lg },
  communityBody: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  communityLink: { fontSize: 13.5, fontWeight: '700', color: colors.primary, marginTop: 2 },
});
