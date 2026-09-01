import { request } from './client';
import type { CommunityReviewSummary, LoanOffer, PropertyInsight, Review } from './types';

export async function getPropertyInsights(propertyId: number) {
  const result = await request<PropertyInsight>(`/properties/${propertyId}/insights`);
  return result.data;
}

export async function getCommunityReviews(city: string, locality?: string) {
  const result = await request<{ reviews: Review[]; summary: CommunityReviewSummary[] }>('/reviews', {
    query: { city, locality },
  });
  return result.data;
}

export async function submitCommunityReview(payload: {
  city: string;
  locality?: string;
  category: string;
  rating: number;
  comment?: string;
}) {
  return request<unknown>('/reviews', { method: 'POST', body: payload });
}

export async function getLoanOffers() {
  const result = await request<LoanOffer[]>('/loan-offers');
  return result.data;
}

export type EmiResult = {
  emi: number;
  total_payable: number;
  total_interest: number;
  principal: number;
  months: number;
};

/** Server-side so the app and any other surface agree to the rupee. */
export async function calculateEmi(principal: number, annualRate: number, tenureYears: number) {
  const result = await request<EmiResult>('/loan-offers/emi', {
    method: 'POST',
    body: { principal, annual_rate: annualRate, tenure_years: tenureYears },
  });
  return result.data;
}
