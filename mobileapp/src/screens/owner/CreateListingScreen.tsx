import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ApiError } from '../../api/client';
import {
  createProperty,
  deletePropertyMedia,
  getLifestyleTags,
  submitForReview,
  updateProperty,
  uploadPropertyMedia,
} from '../../api/properties';
import type { LifestyleTag, ListingType, PropertyDetail, PropertyType } from '../../api/types';
import { Banner, Button, Field } from '../../components/ui';
import { colors, radius, spacing, titleCase } from '../../theme';

const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'villa',
  'plot',
  'land',
  'farmhouse',
  'resort',
  'wedding_venue',
  'hostel',
  'pg',
  'commercial',
  'co_working_space',
  'office_space',
  'shop',
  'warehouse',
];

type PickedPhoto = { uri: string; name: string; type: string };

export function CreateListingScreen({ navigation, route }: any) {
  const editing: PropertyDetail | undefined = route?.params?.property;
  const isEditMode = !!editing;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [propertyType, setPropertyType] = useState<PropertyType>(editing?.property_type ?? 'apartment');
  const [listingType, setListingType] = useState<ListingType>(editing?.listing_type ?? 'sale');
  const [price, setPrice] = useState(editing ? String(editing.price ?? '') : '');
  const [bedrooms, setBedrooms] = useState(editing?.bedrooms ? String(editing.bedrooms) : '');
  const [bathrooms, setBathrooms] = useState(editing?.bathrooms ? String(editing.bathrooms) : '');
  const [area, setArea] = useState(editing?.area_sqft ? String(editing.area_sqft) : '');
  const [city, setCity] = useState(editing?.city ?? '');
  const [state, setState] = useState(editing?.state ?? '');
  const [locality, setLocality] = useState(editing?.locality ?? '');
  const [lifestyleTags, setLifestyleTags] = useState<LifestyleTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [existingMedia, setExistingMedia] = useState(editing?.media ?? []);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: isEditMode ? 'Edit property' : 'Post a property' });
  }, [navigation, isEditMode]);

  useEffect(() => {
    getLifestyleTags()
      .then(setLifestyleTags)
      .catch(() => {
        // Non-critical — the form still works without lifestyle tags.
      });
  }, []);

  function toggleTag(id: number) {
    setSelectedTagIds((current) => (current.includes(id) ? current.filter((t) => t !== id) : [...current, id]));
  }

  async function pickPhotos() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Photo library access is needed to add pictures.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 20 - photos.length - existingMedia.length,
      quality: 0.8,
    });

    if (result.canceled) return;

    const picked: PickedPhoto[] = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}-${index}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    }));

    setPhotos((current) => [...current, ...picked].slice(0, 20));
  }

  function removePhoto(uri: string) {
    setPhotos((current) => current.filter((photo) => photo.uri !== uri));
  }

  async function removeExistingPhoto(mediaId: number) {
    if (!editing) return;
    try {
      await deletePropertyMedia(editing.id, mediaId);
      setExistingMedia((current) => current.filter((m) => m.id !== mediaId));
    } catch {
      setError('Could not remove that photo. Try again.');
    }
  }

  async function handleSubmit(alsoSubmitForReview: boolean) {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setUploadNotice(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      property_type: propertyType,
      listing_type: listingType,
      price: Number(price.replace(/\D/g, '')) || 0,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      area_sqft: area ? Number(area.replace(/\D/g, '')) : undefined,
      city: city.trim(),
      state: state.trim(),
      locality: locality.trim() || undefined,
      lifestyle_tag_ids: selectedTagIds.length ? selectedTagIds : undefined,
    };

    try {
      const saved = isEditMode ? await updateProperty(editing.id, payload) : await createProperty(payload);

      if (photos.length > 0) {
        try {
          await uploadPropertyMedia(saved.id, photos, 'image');
        } catch {
          // The listing itself saved fine — let the owner retry photos from My listings
          // rather than losing the whole submission over an upload hiccup.
          setUploadNotice('Listing saved, but photo upload failed. You can add photos later from My listings.');
        }
      }

      if (alsoSubmitForReview && !isEditMode) {
        await submitForReview(saved.id);
      }

      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          mapped[field] = messages[0];
        }
        setFieldErrors(mapped);
        setError('Please fix the highlighted fields.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not save this listing.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!!error && <Banner tone="error" message={error} />}
        {!!uploadNotice && <Banner tone="info" message={uploadNotice} />}

        <Field
          label="Title"
          value={title}
          onChangeText={setTitle}
          error={fieldErrors.title}
          placeholder="e.g. Spacious 3 BHK villa in Gachibowli"
        />

        <Text style={styles.groupLabel}>Photos</Text>
        <View style={styles.photoGrid}>
          {existingMedia.map((media) => (
            <Pressable key={`existing-${media.id}`} onLongPress={() => removeExistingPhoto(media.id)} style={styles.photoThumb}>
              <Image source={{ uri: media.thumbnail_url ?? media.url }} style={styles.photoImage} />
              <Pressable style={styles.photoRemove} onPress={() => removeExistingPhoto(media.id)}>
                <Text style={styles.photoRemoveText}>×</Text>
              </Pressable>
            </Pressable>
          ))}
          {photos.map((photo) => (
            <Pressable key={photo.uri} onLongPress={() => removePhoto(photo.uri)} style={styles.photoThumb}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <Pressable style={styles.photoRemove} onPress={() => removePhoto(photo.uri)}>
                <Text style={styles.photoRemoveText}>×</Text>
              </Pressable>
            </Pressable>
          ))}
          {photos.length + existingMedia.length < 20 && (
            <Pressable style={styles.addPhotoTile} onPress={pickPhotos}>
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoLabel}>Add photos</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.groupLabel}>Listing type</Text>
        <View style={styles.chipRow}>
          {(['sale', 'rent'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setListingType(option)}
              style={[styles.chip, listingType === option && styles.chipActive]}
            >
              <Text style={[styles.chipText, listingType === option && styles.chipTextActive]}>
                {option === 'sale' ? 'For sale' : 'For rent'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.groupLabel}>Property type</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map((option) => (
            <Pressable
              key={option}
              onPress={() => setPropertyType(option)}
              style={[styles.chip, propertyType === option && styles.chipActive]}
            >
              <Text style={[styles.chipText, propertyType === option && styles.chipTextActive]}>
                {titleCase(option)}
              </Text>
            </Pressable>
          ))}
        </View>

        {lifestyleTags.length > 0 && (
          <>
            <Text style={styles.groupLabel}>Lifestyle tags (optional)</Text>
            <View style={styles.chipRow}>
              {lifestyleTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() => toggleTag(tag.id)}
                    style={[styles.chip, selected && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{tag.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Field
          label="Price (₹)"
          value={price}
          onChangeText={setPrice}
          error={fieldErrors.price}
          keyboardType="number-pad"
          placeholder="e.g. 15000000"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field
              label="Bedrooms"
              value={bedrooms}
              onChangeText={setBedrooms}
              keyboardType="number-pad"
              placeholder="3"
            />
          </View>
          <View style={styles.rowItem}>
            <Field
              label="Bathrooms"
              value={bathrooms}
              onChangeText={setBathrooms}
              keyboardType="number-pad"
              placeholder="2"
            />
          </View>
        </View>

        <Field
          label="Built-up area (sq ft)"
          value={area}
          onChangeText={setArea}
          keyboardType="number-pad"
          placeholder="1800"
        />

        <Field label="City" value={city} onChangeText={setCity} error={fieldErrors.city} placeholder="Hyderabad" />
        <Field label="State" value={state} onChangeText={setState} error={fieldErrors.state} placeholder="Telangana" />
        <Field label="Locality" value={locality} onChangeText={setLocality} placeholder="Gachibowli" />

        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the property…"
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        {isEditMode ? (
          <>
            <Text style={styles.note}>
              Saving changes to a published listing may require re-review before it's public again.
            </Text>
            <Button title="Save changes" onPress={() => handleSubmit(false)} loading={saving} />
          </>
        ) : (
          <>
            <Text style={styles.note}>
              New listings are reviewed by our team before going live. You can save a draft now and submit
              it later from My listings.
            </Text>
            <Button title="Save and submit for review" onPress={() => handleSubmit(true)} loading={saving} />
            <Button
              title="Save as draft"
              variant="secondary"
              onPress={() => handleSubmit(false)}
              disabled={saving}
              style={{ marginTop: spacing.md }}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  groupLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12.5, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  note: { fontSize: 12.5, color: colors.muted, marginBottom: spacing.lg, lineHeight: 18 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  photoThumb: { width: 84, height: 84, borderRadius: radius.sm, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 13, lineHeight: 14 },
  addPhotoTile: {
    width: 84,
    height: 84,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  addPhotoIcon: { fontSize: 22, color: colors.primary },
  addPhotoLabel: { fontSize: 10.5, color: colors.muted, marginTop: 2 },
});
