import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import * as authApi from '../api/auth';
import { ApiError } from '../api/client';
import { canCreateListings, useAuth } from '../auth/AuthContext';
import { Badge, Banner, Button, Card, Field } from '../components/ui';
import { colors, spacing, titleCase } from '../theme';

export function ProfileScreen({ navigation }: any) {
  const { user, signOut, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await authApi.updateProfile({ name: name.trim(), city: city.trim() });
      setUser(result.data);
      setNotice('Profile updated.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.contact}>{user?.email}</Text>
        <Text style={styles.contact}>
          {user?.phone} {user?.phone_verified ? '✓' : ''}
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={titleCase(user?.role)} />
          <Badge label={titleCase(user?.status)} tone={user?.status === 'active' ? 'success' : 'warning'} />
        </View>
      </Card>

      {canCreateListings(user) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Listings</Text>
          <Text style={styles.sectionHint}>Manage the properties you've posted.</Text>
          <Button title="My listings" variant="secondary" onPress={() => navigation.navigate('MyListings')} />
        </Card>
      )}

      {!!user && ['owner', 'landlord', 'builder', 'agent'].includes(user.role) && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <Text style={styles.sectionHint}>Unlock premium features for your account type.</Text>
          <Button title="View plans" variant="secondary" onPress={() => navigation.navigate('SubscriptionPlans')} />
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tools</Text>
        <Button title="Visit requests" variant="secondary" onPress={() => navigation.navigate('MyVisits')} />
        <Button title="My bookings" variant="secondary" onPress={() => navigation.navigate('MyBookings')} />
        <Button title="Notifications" variant="secondary" onPress={() => navigation.navigate('Notifications')} />
        <Button title="Saved searches" variant="secondary" onPress={() => navigation.navigate('SavedSearches')} />
        <Button title="EMI Calculator" variant="secondary" onPress={() => navigation.navigate('EmiCalculator')} />
        <Button title="Home Loan offers" variant="secondary" onPress={() => navigation.navigate('HomeLoan')} />
        <Button title="All services" variant="secondary" onPress={() => navigation.navigate('Services')} />
        {!!user?.city && (
          <Button
            title={`${user.city} community reviews`}
            variant="secondary"
            onPress={() => navigation.navigate('CommunityReview', { city: user.city })}
          />
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Edit profile</Text>

        {!!notice && <Banner tone="success" message={notice} />}
        {!!error && <Banner tone="error" message={error} />}

        <Field label="Full name" value={name} onChangeText={setName} />
        <Field label="City" value={city} onChangeText={setCity} placeholder="e.g. Hyderabad" />

        <Button title="Save changes" onPress={handleSave} loading={saving} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Button title="Sign out" variant="danger" onPress={confirmSignOut} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  headerCard: { gap: 4 },
  card: { gap: spacing.sm },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  contact: { fontSize: 13.5, color: colors.muted },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionHint: { fontSize: 13, color: colors.muted, marginBottom: spacing.sm },
});
