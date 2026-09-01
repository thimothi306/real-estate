import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../api/client';
import { getMySubscription, getSubscriptionPlans, subscribeToPlan, type SubscriptionPlan } from '../api/payments';
import { useAuth } from '../auth/AuthContext';
import { Badge, Banner, Button, Card, Loading } from '../components/ui';
import { colors, spacing } from '../theme';

export function SubscriptionPlansScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<{ plan: SubscriptionPlan; ends_at: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getSubscriptionPlans(), getMySubscription()])
      .then(([allPlans, subscription]) => {
        setPlans(allPlans.filter((p) => p.target_role === user?.role));
        if (subscription) setActivePlan({ plan: subscription.plan, ends_at: subscription.ends_at });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load plans.'))
      .finally(() => setLoading(false));
  }, [user?.role]);

  async function handleSubscribe(plan: SubscriptionPlan) {
    setBusyPlanId(plan.id);
    setNotice(null);

    try {
      const order = await subscribeToPlan(plan.id);
      setNotice(
        `Order created (₹${order.amount / 100}). Checkout isn't wired into this build yet — ` +
          'it needs the native Razorpay SDK, which requires a custom dev build rather than Expo Go.'
      );
    } catch (err) {
      // The backend returns a clear message when Razorpay keys aren't configured yet.
      setNotice(err instanceof ApiError ? err.message : 'Could not start checkout.');
    } finally {
      setBusyPlanId(null);
    }
  }

  if (loading) return <Loading />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {!!error && <Banner tone="error" message={error} />}
      {!!notice && <Banner tone="info" message={notice} />}

      {activePlan && (
        <Card style={styles.activeCard}>
          <Badge label="Active" tone="success" />
          <Text style={styles.activePlanName}>{activePlan.plan.name}</Text>
          <Text style={styles.activeUntil}>
            Renews / expires {new Date(activePlan.ends_at).toLocaleDateString('en-IN')}
          </Text>
        </Card>
      )}

      {plans.length === 0 ? (
        <Text style={styles.empty}>No plans are available for your account type yet.</Text>
      ) : (
        plans.map((plan) => (
          <Card key={plan.id} style={styles.planCard}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              ₹{plan.price} <Text style={styles.planPeriod}>/ {plan.duration_days} days</Text>
            </Text>
            {plan.features.map((feature) => (
              <Text key={feature} style={styles.feature}>
                • {feature}
              </Text>
            ))}
            <Button
              title="Subscribe"
              onPress={() => handleSubscribe(plan)}
              loading={busyPlanId === plan.id}
            />
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  activeCard: { gap: 4 },
  activePlanName: { fontSize: 16, fontWeight: '700', color: colors.text },
  activeUntil: { fontSize: 12.5, color: colors.muted },
  planCard: { gap: 6 },
  planName: { fontSize: 16, fontWeight: '700', color: colors.text },
  planPrice: { fontSize: 20, fontWeight: '700', color: colors.primary },
  planPeriod: { fontSize: 13, fontWeight: '400', color: colors.muted },
  feature: { fontSize: 13, color: colors.text },
  empty: { fontSize: 13.5, color: colors.muted, textAlign: 'center', paddingVertical: spacing.xl },
});
