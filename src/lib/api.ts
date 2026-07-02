import Constants from 'expo-constants';
import { supabase } from './supabase';

const API_URL: string = Constants.expoConfig?.extra?.apiUrl;

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeader()),
    ...(init.headers ?? {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Profile {
  id: string;
  phone: string;
  display_name: string | null;
}
export interface ConversationListItem {
  id: string;
  last_message_at: string | null;
  other: Profile | null;
}
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export const api = {
  syncMe: () => request<Profile>('/users/me/sync', { method: 'POST' }),
  updateProfile: (displayName: string) =>
    request<Profile>('/users/me/profile', {
      method: 'POST',
      body: JSON.stringify({ displayName }),
    }),
  lookupByPhone: (phone: string) =>
    request<Profile>(`/users/lookup?phone=${encodeURIComponent(phone)}`),
  listConversations: () =>
    request<ConversationListItem[]>('/conversations'),
  startConversation: (otherUserId: string) =>
    request<{ id: string }>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
    }),
  listMessages: (convoId: string) =>
    request<ChatMessage[]>(`/conversations/${convoId}/messages`),
  sendMessage: (convoId: string, body: string) =>
    request<ChatMessage>(`/conversations/${convoId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
};
