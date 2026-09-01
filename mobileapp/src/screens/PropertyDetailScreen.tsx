import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { ApiError } from '../api/client';
import { startConversation } from '../api/chat';
import {
  addFavorite,
  createLead,
  getProperty,
  getPropertyTimeline,
  getSimilarProperties,
  removeFavorite,
  reportProperty,
} from '../api/properties';
import { BOOKABLE_PROPERTY_TYPES, type PropertyDetail, type PropertyHistoryEvent, type PropertySummary } from '../api/types';
import { BookingModal } from '../components/BookingModal';
import { PropertyCard } from '../components/PropertyCard';
import { Badge, Banner, Button, Card, Loading } from '../components/ui';
import { VisitScheduleModal } from '../components/VisitScheduleModal';
import { colors, formatPrice, radius, spacing, titleCase } from '../theme';

function formatHistoryEvent(event: PropertyHistoryEvent): string {
  switch (event.event_type) {
    case 'created':
      return 'Listing created';
    case 'price_changed': {
      const from = event.meta?.from != null ? formatPrice(Number(event.meta.from)) : '—';
      const to = event.meta?.to != null ? formatPrice(Number(event.meta.to)) : '—';
      return `Price changed from ${from} to ${to}`;
    }
    case 'status_changed':
      return `Status changed to ${titleCase(String(event.meta?.to ?? ''))}`;
    case 'ownership_changed':
      return 'Ownership changed';
    case 'renovated':
      return 'Renovated';
    default:
      return titleCase(event.event_type);
  }
}

export function PropertyDetailScreen({ navigation, route }: any) {
  const { slug } = route.params as { slug: string };
  const { width } = useWindowDimensions();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [timeline, setTimeline] = useState<PropertyHistoryEvent[]>([]);
  const [similar, setSimilar] = useState<PropertySummary[]>([]);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getProperty(slug);
      setProperty(result);
      setFavorited(result.is_favorited);

      // Best-effort extras — a failure here shouldn't block showing the property itself.
      getPropertyTimeline(result.id).then(setTimeline).catch(() => undefined);
      getSimilarProperties(result.id).then(setSimilar).catch(() => undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this property.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleFavorite() {
    if (!property) return;

    const next = !favorited;
    setFavorited(next);

    try {
      next ? await addFavorite(property.id) : await removeFavorite(property.id);
    } catch (err) {
      setFavorited(!next);
      setNotice(err instanceof ApiError ? err.message : 'Could not update favorites.');
    }
  }

  /**
   * Opens the chat thread with this listing's owner. The backend reuses an
   * existing thread if there is one, so tapping this repeatedly is safe.
   * A lead is recorded alongside so the owner still sees the enquiry in
   * their dashboard, but a failed lead never blocks the chat.
   */
  async function handleContactOwner() {
    if (!property) return;

    setStartingChat(true);

    try {
      const conversation = await startConversation(property.id);
      createLead(property.id, 'message').catch(() => undefined);

      navigation.navigate('ChatDetail', {
        conversationId: conversation.id,
        title: conversation.counterpart?.name ?? property.owner?.name,
      });
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Could not open a chat with the owner.');
    } finally {
      setStartingChat(false);
    }
  }

  async function contactOwner(type: 'call' | 'callback_request') {
    if (!property) return;

    setBusy(true);

    try {
      await createLead(property.id, type);

      if (type === 'call' && property.owner?.phone) {
        await Linking.openURL(`tel:${property.owner.phone}`);
      } else {
        setNotice("Request sent — the owner will get back to you.");
      }
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Could not contact the owner.');
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (!property) return;

    try {
      await Share.share({
        message: `${property.title} — ${formatPrice(property.price)}\nhttps://kavuriestates.com/properties/${property.slug}`,
      });
    } catch {
      // User cancelled the share sheet — nothing to do.
    }
  }

  function openInMaps() {
    if (!property?.latitude || !property?.longitude) {
      setNotice('This property has no location pin yet.');
      return;
    }

    const label = encodeURIComponent(property.title);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${property.latitude},${property.longitude}`,
      android: `geo:0,0?q=${property.latitude},${property.longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`,
    })!;

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`);
    });
  }

  function handleReport() {
    if (!property) return;

    Alert.alert('Report this listing', 'What seems wrong?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Looks fake', onPress: () => submitReport('fake_listing') },
      { text: 'Wrong information', onPress: () => submitReport('incorrect_info') },
      { text: 'Already sold', onPress: () => submitReport('sold_already') },
    ]);
  }

  async function submitReport(reason: string) {
    if (!property) return;

    try {
      await reportProperty(property.id, reason);
      setNotice('Thanks — our team will review this listing.');
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Could not submit the report.');
    }
  }

  if (loading) return <Loading />;

  if (error || !property) {
    return (
      <View style={styles.errorWrap}>
        <Banner tone="error" message={error ?? 'Property not found.'} />
      </View>
    );
  }

  const images = (property.media ?? []).filter((item) => item.type === 'image');
  const isBookable = BOOKABLE_PROPERTY_TYPES.includes(property.property_type);

  const facts: [string, string][] = [
    ['Type', titleCase(property.property_type)],
    ['Listing', property.listing_type === 'rent' ? 'For rent' : 'For sale'],
    ['Bedrooms', property.bedrooms ? String(property.bedrooms) : '—'],
    ['Bathrooms', property.bathrooms ? String(property.bathrooms) : '—'],
    ['Built-up area', property.area_sqft ? `${Math.round(property.area_sqft)} sq ft` : '—'],
    ['Plot size', property.plot_size_sqft ? `${Math.round(property.plot_size_sqft)} sq ft` : '—'],
    ['Floor', property.floor_no != null ? `${property.floor_no} of ${property.total_floors ?? '—'}` : '—'],
    ['Facing', titleCase(property.facing)],
    ['Furnishing', titleCase(property.furnishing_status)],
    ['RERA', property.is_rera_approved ? property.rera_number || 'Approved' : 'Not approved'],
  ];

  const features = [
    property.has_balcony && 'Balcony',
    property.has_swimming_pool && 'Swimming pool',
    property.has_garden && 'Garden',
    property.has_parking && 'Parking',
  ].filter(Boolean) as string[];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {images.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {images.map((image) => (
            <Image key={image.id} source={{ uri: image.url }} style={{ width, height: 240 }} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.galleryFallback, { width }]}>
          <Text style={styles.galleryFallbackText}>No photos yet</Text>
        </View>
      )}

      <View style={styles.body}>
        {!!notice && <Banner tone="info" message={notice} />}

        <View style={styles.priceRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.price}>{formatPrice(property.price)}</Text>
            {property.listing_type === 'rent' && property.rent_price != null && (
              <Text style={styles.rent}>{formatPrice(property.rent_price)} / month</Text>
            )}
          </View>
          <Pressable onPress={handleShare} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>Share</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{property.title}</Text>
        <Pressable onPress={openInMaps}>
          <Text style={[styles.location, styles.locationLink]}>
            📍 {[property.address_line, property.locality, property.city, property.state, property.pincode]
              .filter(Boolean)
              .join(', ')}
          </Text>
        </Pressable>

        {(property.verifications ?? []).length > 0 && (
          <View style={styles.badgeRow}>
            {property.verifications!.map((badge) => (
              <Badge key={badge} label={titleCase(badge)} tone="success" />
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Button
            title={favorited ? '♥ Saved' : '♡ Save'}
            variant="secondary"
            onPress={toggleFavorite}
            style={{ flex: 1 }}
          />
          <Button
            title="Contact Owner"
            onPress={handleContactOwner}
            loading={startingChat}
            style={{ flex: 1.4 }}
          />
        </View>

        {!!property.owner?.phone && (
          <Button title={`Call ${property.owner.name}`} variant="secondary" onPress={() => contactOwner('call')} />
        )}

        <Button
          title="View Property Insights"
          variant="secondary"
          onPress={() =>
            navigation.navigate('PropertyInsights', {
              propertyId: property.id,
              city: property.city,
              locality: property.locality,
            })
          }
          style={{ marginTop: spacing.md }}
        />

        <View style={styles.actionRow}>
          {isBookable ? (
            <Button title="Request booking" variant="secondary" onPress={() => setBookingModalOpen(true)} style={{ flex: 1 }} />
          ) : (
            <Button title="Schedule a visit" variant="secondary" onPress={() => setVisitModalOpen(true)} style={{ flex: 1 }} />
          )}
          {property.listing_type === 'sale' && (
            <Button
              title="EMI Calculator"
              variant="secondary"
              onPress={() => navigation.navigate('EmiCalculator', { price: property.price })}
              style={{ flex: 1 }}
            />
          )}
        </View>

        {!!property.description && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>About this property</Text>
            <Text style={styles.description}>{property.description}</Text>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Property details</Text>
          {facts.map(([label, value]) => (
            <View key={label} style={styles.factRow}>
              <Text style={styles.factLabel}>{label}</Text>
              <Text style={styles.factValue}>{value}</Text>
            </View>
          ))}
        </Card>

        {features.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.chipWrap}>
              {features.map((feature) => (
                <Badge key={feature} label={feature} />
              ))}
            </View>
          </Card>
        )}

        {(property.amenities ?? []).length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.chipWrap}>
              {property.amenities!.map((amenity) => (
                <Badge key={amenity} label={amenity} />
              ))}
            </View>
          </Card>
        )}

        {(property.lifestyle_tags ?? []).length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Suited for</Text>
            <View style={styles.chipWrap}>
              {property.lifestyle_tags!.map((tag) => (
                <Badge key={tag} label={tag} tone="warning" />
              ))}
            </View>
          </Card>
        )}

        {timeline.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Property timeline</Text>
            {timeline.map((event) => (
              <View key={event.id} style={styles.factRow}>
                <Text style={styles.factValue}>{formatHistoryEvent(event)}</Text>
                <Text style={styles.factLabel}>{new Date(event.created_at).toLocaleDateString('en-IN')}</Text>
              </View>
            ))}
          </Card>
        )}

        <Text style={styles.views}>{property.views_count} views</Text>

        <Button title="Report this listing" variant="secondary" onPress={handleReport} />
      </View>

      {similar.length > 0 && (
        <View style={styles.similarSection}>
          <Text style={styles.similarTitle}>Similar properties</Text>
          <View style={{ paddingHorizontal: spacing.lg }}>
            {similar.map((item) => (
              <PropertyCard
                key={item.id}
                property={item}
                onPress={() => navigation.push('PropertyDetail', { slug: item.slug })}
              />
            ))}
          </View>
        </View>
      )}

      <VisitScheduleModal
        visible={visitModalOpen}
        propertyId={property.id}
        onClose={() => setVisitModalOpen(false)}
        onScheduled={() => setNotice('Visit scheduled — the owner will confirm shortly.')}
      />

      <BookingModal
        visible={bookingModalOpen}
        propertyId={property.id}
        onClose={() => setBookingModalOpen(false)}
        onBooked={() => setNotice('Booking request sent — the owner will confirm shortly.')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  errorWrap: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  gallery: { height: 240, backgroundColor: '#e9edf2' },
  galleryFallback: { height: 240, backgroundColor: '#e9edf2', alignItems: 'center', justifyContent: 'center' },
  galleryFallbackText: { color: colors.muted, fontSize: 14 },
  body: { padding: spacing.lg, gap: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  price: { fontSize: 26, fontWeight: '700', color: colors.text },
  rent: { fontSize: 15, color: colors.muted, marginTop: 2 },
  iconButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  iconButtonText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  location: { fontSize: 14, color: colors.muted },
  locationLink: { color: colors.primary },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  card: { gap: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  description: { fontSize: 14, color: colors.text, lineHeight: 21 },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  factLabel: { fontSize: 13.5, color: colors.muted },
  factValue: { fontSize: 13.5, color: colors.text, fontWeight: '500' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  views: { fontSize: 12.5, color: colors.muted, textAlign: 'center' },
  similarSection: { marginTop: spacing.lg, gap: spacing.md },
  similarTitle: { fontSize: 17, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.lg },
});
