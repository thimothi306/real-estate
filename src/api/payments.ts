import { request } from './client';

export type SubscriptionPlan = {
  id: number;
  name: string;
  slug: string;
  target_role: string;
  price: number;
  duration_days: number;
  features: string[];
};

export type PaymentOrder = {
  payment_id: number;
  razorpay_order_id: string;
  razorpay_key: string;
  amount: number;
  currency: string;
};

export async function getSubscriptionPlans() {
  const result = await request<SubscriptionPlan[]>('/subscription-plans');
  return result.data;
}

export async function purchaseFeaturedListing(propertyId: number) {
  const result = await request<PaymentOrder>(`/properties/${propertyId}/feature`, { method: 'POST' });
  return result.data;
}

export async function subscribeToPlan(planId: number) {
  const result = await request<PaymentOrder>(`/subscription-plans/${planId}/subscribe`, { method: 'POST' });
  return result.data;
}

export async function verifyPayment(payload: {
  payment_id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) {
  return request<unknown>('/payments/verify', { method: 'POST', body: payload });
}

export async function getMySubscription() {
  const result = await request<{ id: number; status: string; ends_at: string; plan: SubscriptionPlan } | null>(
    '/my/subscription'
  );
  return result.data;
}
