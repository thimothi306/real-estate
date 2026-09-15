import { request } from './client';
import type { Paginated } from './types';

export type PartnerProfile = {
  id: number;
  user_id: number;
  profession: string | null;
  business_name: string;
  bio: string | null;
  cities_served: string[] | null;
  years_experience: string | null;
  is_verified: boolean;
  total_completed: number;
  rating_avg: number | null;
  rating_count: number;
  user?: { id: number; name: string; phone: string; city: string | null };
  categories?: { id: number; name: string; slug: string }[];
};

export async function getPartnerDirectory(filters: { category?: string; city?: string } = {}): Promise<Paginated<PartnerProfile>> {
  const result = await request<PartnerProfile[]>('/partners', { query: filters });
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function getMyPartnerProfile() {
  const result = await request<PartnerProfile | null>('/my/partner-profile');
  return result.data;
}

export async function updatePartnerProfile(payload: {
  profession: string;
  business_name: string;
  bio?: string;
  cities_served?: string[];
  years_experience?: string;
  category_ids?: number[];
}) {
  const result = await request<PartnerProfile>('/my/partner-profile', { method: 'PUT', body: payload });
  return result.data;
}
