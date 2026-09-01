import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ApiError } from '../../api/client';
import { getMyProperties, getProperty, submitForReview } from '../../api/properties';
import { purchaseFeaturedListing } from '../../api/payments';
import { BOOKABLE_PROPERTY_TYPES, type PropertySummary } from '../../api/types';
import { PropertyCard } from '../../components/PropertyCard';
import { Banner, Button, EmptyState, Loading } from '../../components/ui';
import { colors, spacing } from '../../theme';

export function MyListingsScreen({ navigation }: any) {
  const [items, setItems] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const result = await getMyProperties();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your listings.');
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

  function handlePress(property: PropertySummary) {
    const bookable = BOOKABLE_PROPERTY_TYPES.includes(property.property_type);

    // A draft has no public page yet, so offer the next step instead.
    if (property.status === 'draft') {
      Alert.alert(
        property.title,
        'This listing is still a draft. Submit it for review to get it published.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Edit', onPress: () => void handleEdit(property) },
          { text: 'Submit for review', onPress: () => void handleSubmit(property) },
        ]
      );
      return;
    }

    if (property.status === 'published') {
      const actions: any[] = [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View listing', onPress: () => navigation.navigate('PropertyDetail', { slug: property.slug }) },
        { text: 'Edit', onPress: () => void handleEdit(property) },
      ];
      if (bookable) {
        actions.push({
          text: 'Manage bookings',
          onPress: () => navigation.navigate('ManageBookings', { propertyId: property.id, title: property.title }),
        });
      }
      actions.push({
        text: property.is_featured ? 'Already featured' : 'Feature this listing',
        onPress: property.is_featured ? undefined : () => void handleFeature(property),
      });
      Alert.alert(property.title, undefined, actions);
      return;
    }

    Alert.alert(
      property.title,
      property.status === 'pending_review'
        ? 'This listing is waiting for admin review.'
        : `This listing is currently ${property.status?.replace('_', ' ')}.`,
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Edit', onPress: () => void handleEdit(property) },
      ]
    );
  }

  async function handleEdit(property: PropertySummary) {
    try {
      const full = await getProperty(property.slug);
      navigation.navigate('CreateListing', { property: full });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not open this listing for editing.');
    }
  }

  async function handleSubmit(property: PropertySummary) {
    try {
      await submitForReview(property.id);
      setNotice('Submitted for review. You will be notified once it is approved.');
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit that listing.');
    }
  }

  async function handleFeature(property: PropertySummary) {
    try {
      const order = await purchaseFeaturedListing(property.id);
      setNotice(
        `Order created (₹${order.amount / 100}). Checkout isn't wired into this build yet — ` +
          'it needs the native Razorpay SDK, which requires a custom dev build rather than Expo Go.'
      );
    } catch (err) {
      // The backend returns a clear message when Razorpay keys aren't configured yet.
      setError(err instanceof ApiError ? err.message : 'Could not start checkout.');
    }
  }

  if (loading) return <Loading />;

  return (
    <View style={styles.screen}>
      <FlatList
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
          />
        }
        ListHeaderComponent={
          <>
            {!!error && <Banner tone="error" message={error} />}
            {!!notice && <Banner tone="success" message={notice} />}
          </>
        }
        ListEmptyComponent={
          error ? null : (
            <EmptyState title="No listings yet" subtitle="Post your first property to get started." />
          )
        }
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={() => handlePress(item)} showStatus />
        )}
      />

      <View style={styles.footer}>
        <Button title="Post a new property" onPress={() => navigation.navigate('CreateListing')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, flexGrow: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
