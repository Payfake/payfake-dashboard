import { create } from "zustand";
import { api } from "@/lib/api";

interface Webhook {
  id: string;
  merchant_id: string;
  transaction_id: string;
  event: string;
  payload: any;
  delivered: boolean;
  attempts: number;
  last_attempt_at: string | null;
  created_at: string;
}

interface WebhookAttempt {
  id: string;
  webhook_event_id: string;
  status_code: number;
  response_body: string;
  succeeded: boolean;
  attempted_at: string;
}

interface Meta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

interface WebhookState {
  webhooks: Webhook[];
  meta: Meta | null;
  isLoading: boolean;
  attempts: WebhookAttempt[];
  attemptsLoading: boolean;
  fetchWebhooks: (page?: number) => Promise<void>;
  fetchAttempts: (webhookId: string) => Promise<void>;
  retryWebhook: (webhookId: string) => Promise<void>;
}

export const useWebhookStore = create<WebhookState>((set, get) => ({
  webhooks: [],
  meta: null,
  isLoading: false,
  attempts: [],
  attemptsLoading: false,

  fetchWebhooks: async (page = 1) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
      });

      const response = await api.get(`/control/webhooks?${params}`);
      set({
        webhooks: response.data.data.webhooks,
        meta: response.data.data.meta,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAttempts: async (webhookId: string) => {
    set({ attemptsLoading: true });
    try {
      const response = await api.get(`/control/webhooks/${webhookId}/attempts`);
      set({ attempts: response.data.data.attempts });
    } finally {
      set({ attemptsLoading: false });
    }
  },

  retryWebhook: async (webhookId: string) => {
    await api.post(`/control/webhooks/${webhookId}/retry`);
    await get().fetchWebhooks(get().meta?.page || 1);
  },
}));
