import { request, upload } from './client';
import type {
  Amenity,
  AppNotification,
  AvailabilityBlock,
  Booking,
  LifestyleTag,
  Paginated,
  PropertyDetail,
  PropertyHistoryEvent,
  PropertyMedia,
  PropertySummary,
  SearchFilters,
  Visit,
} from './types';

export async function searchProperties(filters: SearchFilters = {}): Promise<Paginated<PropertySummary>> {
  const result = await request<PropertySummary[]>('/properties', { query: filters as Record<string, any> });

  return {
    items: result.data ?? [],
    currentPage: result.meta?.current_page ?? 1,
    lastPage: result.meta?.last_page ?? 1,
    total: result.meta?.total ?? 0,
  };
}

export async function getProperty(slug: string) {
  const result = await request<PropertyDetail>(`/properties/${slug}`);
  return result.data;
}

export async function compareProperties(ids: number[]) {
  const result = await request<PropertyDetail[]>('/properties/compare', {
    query: { ids: ids.join(',') },
  });
  return result.data;
}

export async function getPropertyTimeline(propertyId: number) {
  const result = await request<PropertyHistoryEvent[]>(`/properties/${propertyId}/timeline`);
  return result.data;
}

export async function getSimilarProperties(propertyId: number) {
  const result = await request<PropertySummary[]>(`/properties/${propertyId}/similar`);
  return result.data;
}

export async function getAmenities() {
  const result = await request<Amenity[]>('/amenities');
  return result.data;
}

export async function getLifestyleTags() {
  const result = await request<LifestyleTag[]>('/lifestyle-tags');
  return result.data;
}

export async function getCities(q?: string) {
  const result = await request<string[]>('/locations/cities', { query: { q } });
  return result.data;
}

export async function getLocalities(city: string, q?: string) {
  const result = await request<string[]>('/locations/localities', { query: { city, q } });
  return result.data;
}

// ---- Favorites ----

export async function getFavorites(): Promise<Paginated<PropertySummary>> {
  const result = await request<PropertySummary[]>('/favorites');
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function addFavorite(propertyId: number) {
  return request<null>(`/properties/${propertyId}/favorite`, { method: 'POST' });
}

export async function removeFavorite(propertyId: number) {
  return request<null>(`/properties/${propertyId}/favorite`, { method: 'DELETE' });
}

// ---- Recently viewed ----

export async function getRecentlyViewed() {
  const result = await request<PropertySummary[]>('/my/recently-viewed');
  return result.data;
}

// ---- Leads / visits / reports ----

export async function createLead(propertyId: number, type: 'call' | 'message' | 'callback_request' | 'whatsapp', note?: string) {
  return request<unknown>(`/properties/${propertyId}/leads`, {
    method: 'POST',
    body: { type, note },
  });
}

export async function getMyVisits(): Promise<Paginated<Visit>> {
  const result = await request<Visit[]>('/my/visits');
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? result.data?.length ?? 0,
  };
}

export async function cancelVisit(visitId: number) {
  return request<Visit>(`/visits/${visitId}/status`, { method: 'PATCH', body: { status: 'cancelled' } });
}

export async function scheduleVisit(propertyId: number, scheduledAt: string, note?: string) {
  return request<unknown>(`/properties/${propertyId}/visits`, {
    method: 'POST',
    body: { scheduled_at: scheduledAt, note },
  });
}

export async function reportProperty(propertyId: number, reason: string, description?: string) {
  return request<unknown>(`/properties/${propertyId}/report`, {
    method: 'POST',
    body: { reason, description },
  });
}

// ---- Bookings (date-range, for farmhouses/resorts/venues/PGs) ----

export async function getAvailability(propertyId: number) {
  const result = await request<AvailabilityBlock[]>(`/properties/${propertyId}/availability`);
  return result.data;
}

export async function createBooking(propertyId: number, startDate: string, endDate: string, note?: string) {
  const result = await request<Booking>(`/properties/${propertyId}/bookings`, {
    method: 'POST',
    body: { start_date: startDate, end_date: endDate, note },
  });
  return result.data;
}

export async function getMyBookings(): Promise<Paginated<Booking>> {
  const result = await request<Booking[]>('/my/bookings');
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

// ---- Owner ----

export type CreatePropertyPayload = {
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  city: string;
  state: string;
  locality?: string;
  amenity_ids?: number[];
  lifestyle_tag_ids?: number[];
};

export async function createProperty(payload: CreatePropertyPayload) {
  const result = await request<PropertyDetail>('/properties', { method: 'POST', body: payload });
  return result.data;
}

export async function updateProperty(propertyId: number, payload: Partial<CreatePropertyPayload>) {
  const result = await request<PropertyDetail>(`/properties/${propertyId}`, { method: 'PUT', body: payload });
  return result.data;
}

export async function deletePropertyMedia(propertyId: number, mediaId: number) {
  return request<null>(`/properties/${propertyId}/media/${mediaId}`, { method: 'DELETE' });
}

export async function getMyProperties(): Promise<Paginated<PropertySummary>> {
  const result = await request<PropertySummary[]>('/my/properties');
  return {
    items: result.data ?? [],
    currentPage: result.meta?.current_page ?? 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function submitForReview(propertyId: number) {
  return request<PropertyDetail>(`/properties/${propertyId}/submit-for-review`, { method: 'POST' });
}

export async function uploadPropertyMedia(
  propertyId: number,
  files: { uri: string; name: string; type: string }[],
  mediaType: 'image' | 'video' | 'floor_plan' = 'image'
) {
  const parts = [
    { name: 'type', value: mediaType },
    ...files.map((file) => ({ name: 'files[]', value: file })),
  ];

  const result = await upload<PropertyMedia[]>(`/properties/${propertyId}/media`, parts);
  return result.data;
}

export async function getPropertyBookings(propertyId: number): Promise<Paginated<Booking>> {
  const result = await request<Booking[]>(`/properties/${propertyId}/bookings`);
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function updateBookingStatus(bookingId: number, status: 'confirmed' | 'cancelled') {
  return request<Booking>(`/bookings/${bookingId}/status`, { method: 'PATCH', body: { status } });
}

// ---- Saved searches & notifications ----

export async function getSavedSearches() {
  const result = await request<{ id: number; name: string | null; filters: SearchFilters }[]>('/saved-searches');
  return result.data;
}

export async function deleteSavedSearch(id: number) {
  return request<null>(`/saved-searches/${id}`, { method: 'DELETE' });
}

export async function getNotifications() {
  const result = await request<AppNotification[]>('/notifications');
  return {
    items: result.data ?? [],
    unreadCount: result.meta?.unread_count ?? 0,
  };
}

export async function markNotificationRead(id: string) {
  return request<null>(`/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead() {
  return request<null>('/notifications/read-all', { method: 'POST' });
}

export async function saveSearch(name: string, filters: SearchFilters) {
  return request<unknown>('/saved-searches', {
    method: 'POST',
    body: { name, filters, notify_on_match: true },
  });
}
