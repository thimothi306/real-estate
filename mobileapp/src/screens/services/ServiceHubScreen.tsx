import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { getServiceCategories, type ServiceCategory } from '../../api/services';
import { isPartner, useAuth } from '../../auth/AuthContext';
import { Banner, Button, Loading } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';

const CATEGORY_ICONS: Record<string, string> = {
  'home-loan': '🏦',
  'legal-verification': '⚖️',
  'interior-design': '🎨',
  'property-management': '🏢',
  'rental-management': '🔑',
  'registration-assistance': '📋',
  'tenant-verification': '🔍',
  'moving-services': '📦',
  'home-services': '🔧',
};

export function ServiceHubScreen({ navigation }: any) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getServiceCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load services.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <View style={styles.screen}>
      {isPartner(user) && (
        <View style={styles.partnerBanner}>
          <Text style={styles.partnerBannerText}>You have a service provider account.</Text>
          <View style={styles.partnerBannerActions}>
            <Button title="My request queue" variant="secondary" onPress={() => navigation.navigate('ServiceQueue')} />
            <Button title="My profile" variant="secondary" onPress={() => navigation.navigate('PartnerProfile')} />
          </View>
        </View>
      )}

      <FlatList
        contentContainerStyle={styles.list}
        data={categories}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.sm }}
        ListHeaderComponent={
          <>
            {!!error && <Banner tone="error" message={error} />}
            <Text style={styles.heading}>Property services</Text>
            <Text style={styles.subheading}>Request help from a verified partner near you.</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
              <Button
                title="My requests"
                variant="secondary"
                onPress={() => navigation.navigate('MyServiceRequests')}
                style={{ flex: 1 }}
              />
              <Button
                title="Browse partners"
                variant="secondary"
                onPress={() => navigation.navigate('PartnerDirectory')}
                style={{ flex: 1 }}
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.tile}
            onPress={() => navigation.navigate('PostServiceRequest', { category: item })}
          >
            <Text style={styles.tileIcon}>{CATEGORY_ICONS[item.slug] ?? '🛠'}</Text>
            <Text style={styles.tileLabel}>{item.name}</Text>
            {!!item.description && (
              <Text style={styles.tileDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  heading: { fontSize: 21, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 13.5, color: colors.muted, marginTop: 4, marginBottom: spacing.lg },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    minHeight: 110,
  },
  tileIcon: { fontSize: 22 },
  tileLabel: { fontSize: 13.5, fontWeight: '600', color: colors.text },
  tileDescription: { fontSize: 11, color: colors.muted, lineHeight: 15 },
  partnerBanner: {
    backgroundColor: '#eaf1fd',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  partnerBannerText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  partnerBannerActions: { flexDirection: 'row', gap: spacing.sm },
});
