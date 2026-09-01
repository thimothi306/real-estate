import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { compareProperties } from '../api/properties';
import type { PropertyDetail } from '../api/types';
import { Banner, Loading } from '../components/ui';
import { colors, formatPrice, spacing, titleCase } from '../theme';

const ROWS: { label: string; get: (p: PropertyDetail) => string }[] = [
  { label: 'Price', get: (p) => formatPrice(p.price) },
  { label: 'Type', get: (p) => titleCase(p.property_type) },
  { label: 'Listing', get: (p) => (p.listing_type === 'rent' ? 'For rent' : 'For sale') },
  { label: 'Bedrooms', get: (p) => (p.bedrooms ? String(p.bedrooms) : '—') },
  { label: 'Bathrooms', get: (p) => (p.bathrooms ? String(p.bathrooms) : '—') },
  { label: 'Area', get: (p) => (p.area_sqft ? `${Math.round(p.area_sqft)} sq ft` : '—') },
  { label: 'Furnishing', get: (p) => titleCase(p.furnishing_status) },
  { label: 'City', get: (p) => p.city },
  { label: 'Locality', get: (p) => p.locality ?? '—' },
  { label: 'RERA', get: (p) => (p.is_rera_approved ? 'Approved' : 'Not approved') },
  { label: 'Views', get: (p) => String(p.views_count) },
];

export function CompareScreen({ route }: any) {
  const { propertyIds } = route.params as { propertyIds: number[] };

  const [properties, setProperties] = useState<PropertyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    compareProperties(propertyIds)
      .then(setProperties)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load these properties.'))
      .finally(() => setLoading(false));
  }, [propertyIds]);

  if (loading) return <Loading />;
  if (error) return <Banner tone="error" message={error} />;

  return (
    <ScrollView style={styles.screen} horizontal>
      <View>
        <View style={styles.headerRow}>
          <View style={styles.labelCol} />
          {properties.map((property) => (
            <View key={property.id} style={styles.propertyCol}>
              <Text style={styles.propertyTitle} numberOfLines={2}>
                {property.title}
              </Text>
            </View>
          ))}
        </View>

        {ROWS.map((row, index) => (
          <View key={row.label} style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
            <View style={styles.labelCol}>
              <Text style={styles.label}>{row.label}</Text>
            </View>
            {properties.map((property) => (
              <View key={property.id} style={styles.propertyCol}>
                <Text style={styles.value}>{row.get(property)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: colors.border },
  labelCol: { width: 110, padding: spacing.sm, justifyContent: 'center' },
  propertyCol: { width: 150, padding: spacing.sm, justifyContent: 'center' },
  propertyTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowAlt: { backgroundColor: colors.surface },
  label: { fontSize: 12.5, color: colors.muted, fontWeight: '600' },
  value: { fontSize: 13, color: colors.text },
});
