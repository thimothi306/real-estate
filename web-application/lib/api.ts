import type {
  PartnerProfile,
  Paginated,
  PropertyDetail,
  PropertySummary,
  SearchFilters,
  ServiceCategory,
  SubscriptionPlan,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, any>;
};

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }

  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Reads a response as JSON without assuming it is JSON.
 *
 * A PHP fatal error surfaces as an HTML page, sometimes with a 2xx status.
 * Calling response.json() on that throws a SyntaxError that bubbles up as a
 * full page crash — and because Next caches the response, the broken page
 * keeps replaying long after the API recovered. Returning null instead lets
 * each caller degrade to an empty result.
 */
async function readJson<T>(response: Response, path: string): Promise<ApiEnvelope<T> | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('json')) {
    console.error(`[api] ${path} returned ${contentType || 'unknown content-type'} instead of JSON`);
    return null;
  }

  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    console.error(`[api] ${path} returned malformed JSON`);
    return null;
  }
}

async function apiFetch<T>(path: string, options: { revalidate?: number } = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    // Next.js data cache — 60s for most read endpoints unless overridden.
    next: { revalidate: options.revalidate ?? 60 },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  const payload = await readJson<T>(response, path);

  if (!payload || !payload.success) {
    throw new Error(payload?.message ?? `Malformed response from ${path}`);
  }

  return payload.data;
}

export async function searchProperties(filters: SearchFilters = {}): Promise<Paginated<PropertySummary>> {
  const path = `/properties${buildQuery(filters as Record<string, unknown>)}`;
  const empty = { items: [], currentPage: 1, lastPage: 1, total: 0 };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    });
  } catch {
    // Backend down or unreachable — render an empty result rather than a
    // 500 page for the whole route.
    return empty;
  }

  if (!response.ok) return empty;

  const payload = await readJson<PropertySummary[]>(response, path);
  if (!payload) return empty;

  return {
    items: payload.data ?? [],
    currentPage: payload.meta?.current_page ?? 1,
    lastPage: payload.meta?.last_page ?? 1,
    total: payload.meta?.total ?? 0,
  };
}

export async function getProperty(slug: string): Promise<PropertyDetail | null> {
  try {
    // Revalidate faster than search results — a visitor landing on a detail
    // page (often from a shared link) should see accurate status quickly.
    return await apiFetch<PropertyDetail>(`/properties/${slug}`, { revalidate: 15 });
  } catch {
    return null;
  }
}

export async function getCities(q?: string): Promise<string[]> {
  try {
    return await apiFetch<string[]>(`/locations/cities${buildQuery({ q })}`, { revalidate: 3600 });
  } catch {
    return [];
  }
}

export type LoanOffer = {
  id: number;
  lender_name: string;
  interest_rate_from: number;
  max_amount: number;
  max_tenure_years: number;
  processing_fee_percent: number | null;
  highlight: string | null;
  apply_url: string | null;
};

export async function getLoanOffers(): Promise<LoanOffer[]> {
  try {
    return await apiFetch<LoanOffer[]>('/loan-offers', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export type CategoryCounts = {
  by_property_type: Record<string, number>;
  by_listing_type: Record<string, number>;
};

/** One request for every category tile's count, instead of one search request per category. */
export async function getCategoryCounts(): Promise<CategoryCounts> {
  try {
    return await apiFetch<CategoryCounts>('/properties/category-counts', { revalidate: 60 });
  } catch {
    return { by_property_type: {}, by_listing_type: {} };
  }
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    return await apiFetch<ServiceCategory[]>('/service-categories', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    return await apiFetch<SubscriptionPlan[]>('/subscription-plans', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export async function getPartnerDirectory(filters: { category?: string; city?: string } = {}): Promise<Paginated<PartnerProfile>> {
  const empty = { items: [], currentPage: 1, lastPage: 1, total: 0 };
  const path = `/partners${buildQuery(filters)}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
  } catch {
    return empty;
  }

  if (!response.ok) return empty;

  const payload = await readJson<PartnerProfile[]>(response, path);
  if (!payload) return empty;

  return {
    items: payload.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: payload.meta?.total ?? 0,
  };
}

export async function getPartner(userId: number): Promise<PartnerProfile | null> {
  try {
    return await apiFetch<PartnerProfile>(`/partners/${userId}`, { revalidate: 60 });
  } catch {
    return null;
  }
}

/**
 * "Tell us what you need" — public lead-capture, no login required. Posted
 * from a client component, so this can't use Next's fetch cache the way the
 * read helpers above do; errors surface to the caller instead of degrading
 * to an empty result, since a failed submission needs to tell the visitor.
 */
export async function submitPropertyRequirement(payload: {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  property_type?: string;
  listing_type?: 'sale' | 'rent';
  budget_min?: number;
  budget_max?: number;
  message?: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/property-requirements`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const payloadJson = await readJson<null>(response, '/property-requirements');

  if (!response.ok || !payloadJson?.success) {
    throw new Error(payloadJson?.message ?? 'Could not submit your requirement. Please try again.');
  }
}
