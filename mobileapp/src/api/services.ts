import { request } from './client';
import type { Paginated } from './types';

export type ServiceCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_property_specific: boolean;
};

export type ServiceQuote = {
  id: number;
  service_request_id: number;
  partner_id: number;
  amount: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  valid_until: string | null;
  partner?: { id: number; name: string; phone: string };
  request?: { id: number; title: string; status: string };
};

export type ServiceRequestStatus = 'open' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type ServiceRequestSummary = {
  id: number;
  title: string;
  description: string | null;
  status: ServiceRequestStatus;
  budget_min: number | null;
  budget_max: number | null;
  category?: { id: number; name: string; slug: string };
  property?: { id: number; title: string; slug: string; city: string };
  assigned_partner?: { id: number; name: string; phone: string };
  quotes_count?: number;
  created_at: string;
};

export type ServiceRequestDetail = ServiceRequestSummary & {
  requester?: { id: number; name: string; phone: string };
  quotes?: ServiceQuote[];
};

export async function getServiceCategories() {
  const result = await request<ServiceCategory[]>('/service-categories');
  return result.data;
}

export async function createServiceRequest(payload: {
  service_category_id: number;
  property_id?: number;
  title: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
}) {
  const result = await request<ServiceRequestDetail>('/service-requests', { method: 'POST', body: payload });
  return result.data;
}

export async function getMyServiceRequests(): Promise<Paginated<ServiceRequestSummary>> {
  const result = await request<ServiceRequestSummary[]>('/my/service-requests');
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function getServiceRequest(id: number) {
  const result = await request<ServiceRequestDetail>(`/service-requests/${id}`);
  return result.data;
}

export async function cancelServiceRequest(id: number) {
  return request<ServiceRequestDetail>(`/service-requests/${id}/cancel`, { method: 'POST' });
}

export async function reviewServiceRequest(id: number, rating: number, comment?: string) {
  return request<unknown>(`/service-requests/${id}/review`, { method: 'POST', body: { rating, comment } });
}

// ---- Partner side ----

export async function getServiceQueue(): Promise<Paginated<ServiceRequestSummary>> {
  const result = await request<ServiceRequestSummary[]>('/my/service-queue');
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function submitQuote(requestId: number, amount: number, message?: string) {
  const result = await request<ServiceQuote>(`/service-requests/${requestId}/quotes`, {
    method: 'POST',
    body: { amount, message },
  });
  return result.data;
}

export async function getMyQuotes(): Promise<Paginated<ServiceQuote>> {
  const result = await request<ServiceQuote[]>('/my/quotes');
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function withdrawQuote(quoteId: number) {
  return request<ServiceQuote>(`/quotes/${quoteId}/withdraw`, { method: 'POST' });
}

export async function acceptQuote(quoteId: number) {
  const result = await request<ServiceRequestDetail>(`/quotes/${quoteId}/accept`, { method: 'POST' });
  return result.data;
}

export async function updateServiceRequestStatus(requestId: number, status: 'in_progress' | 'completed') {
  return request<ServiceRequestDetail>(`/service-requests/${requestId}/status`, { method: 'PATCH', body: { status } });
}
