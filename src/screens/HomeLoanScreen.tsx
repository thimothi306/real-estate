import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getLoanOffers } from '../api/insights';
import type { LoanOffer } from '../api/types';
import { Banner, Button, Loading } from '../components/ui';
import { colors, formatPrice, radius, shadow, spacing } from '../theme';

const BENEFITS = [
  { icon: '📉', label: 'Lowest interest rates' },
  { icon: '⚡', label: 'Quick approval' },
  { icon: '📄', label: 'Minimal documentation' },
  { icon: '🏦', label: 'Top bank partners' },
];

export function HomeLoanScreen({ navigation }: any) {
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLoanOffers()
      .then(setOffers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load loan offers.'))
      .finally(() => setLoading(false));
  }, []);

  function handleApply(offer: LoanOffer) {
    if (offer.apply_url) {
      void Linking.openURL(offer.apply_url);
      return;
    }
    // No partner URL configured yet — send them to the calculator so the
    // screen still does something useful instead of a dead button.
    navigation.navigate('EmiCalculator');
  }

  if (loading) return <Loading />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {!!error && <Banner tone="error" message={error} />}

      <View style={[styles.hero, shadow.sm]}>
        <Text style={styles.heroTitle}>Get the best home loan for your dream property</Text>
        <View style={styles.benefits}>
          {BENEFITS.map((benefit) => (
            <View key={benefit.label} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={styles.benefitLabel}>{benefit.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        title="Calculate your EMI"
        variant="secondary"
        onPress={() => navigation.navigate('EmiCalculator')}
        style={{ marginBottom: spacing.xl }}
      />

      <Text style={styles.sectionTitle}>Recommended for you</Text>

      {offers.map((offer) => (
        <View key={offer.id} style={[styles.offer, shadow.sm]}>
          <View style={styles.offerLeft}>
            <View style={styles.lenderBadge}>
              <Text style={styles.lenderInitial}>{offer.lender_name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lenderName} numberOfLines={1}>
                {offer.lender_name}
              </Text>
              <Text style={styles.rate}>{offer.interest_rate_from}% p.a.</Text>
              <Text style={styles.maxAmount}>Up to {formatPrice(offer.max_amount)}</Text>
              {!!offer.highlight && <Text style={styles.highlight}>{offer.highlight}</Text>}
            </View>
          </View>

          <Pressable
            onPress={() => handleApply(offer)}
            style={({ pressed }) => [styles.applyButton, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.applyText}>Apply Now</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.disclaimer}>
        Rates shown are indicative starting rates from partner lenders and may vary based on your credit profile.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  heroTitle: { fontSize: 19, fontWeight: '800', color: colors.text, lineHeight: 26, marginBottom: spacing.lg },
  benefits: { gap: spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  benefitIcon: { fontSize: 14 },
  benefitLabel: { fontSize: 13.5, color: colors.muted, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  offerLeft: { flex: 1, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  lenderBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lenderInitial: { fontSize: 17, fontWeight: '800', color: colors.primary },
  lenderName: { fontSize: 14, fontWeight: '700', color: colors.text },
  rate: { fontSize: 13, fontWeight: '700', color: colors.success, marginTop: 1 },
  maxAmount: { fontSize: 11.5, color: colors.muted, marginTop: 1 },
  highlight: { fontSize: 11, color: colors.gold, fontWeight: '600', marginTop: 2 },
  applyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  applyText: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  disclaimer: { fontSize: 11.5, color: colors.faint, lineHeight: 17, marginTop: spacing.md },
});
