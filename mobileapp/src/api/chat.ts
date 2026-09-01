import { request } from './client';
import type { Conversation, Message, Paginated } from './types';

export async function getConversations(): Promise<Paginated<Conversation>> {
  const result = await request<Conversation[]>('/conversations');
  return {
    items: result.data ?? [],
    currentPage: 1,
    lastPage: 1,
    total: result.meta?.total ?? 0,
  };
}

export async function getConversation(id: number) {
  const result = await request<Conversation>(`/conversations/${id}`);
  return result.data;
}

/** Idempotent — reuses the existing thread if the buyer already messaged this owner. */
export async function startConversation(propertyId: number) {
  const result = await request<Conversation>(`/properties/${propertyId}/conversation`, { method: 'POST' });
  return result.data;
}

export async function sendMessage(conversationId: number, body: string) {
  const result = await request<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { body },
  });
  return result.data;
}

export async function getUnreadCount() {
  const result = await request<{ unread_count: number }>('/conversations/unread-count');
  return result.data.unread_count;
}
