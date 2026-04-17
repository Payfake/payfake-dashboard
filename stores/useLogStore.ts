import { create } from "zustand";
import { api } from "@/lib/api";

interface Log {
  id: string;
  merchant_id: string;
  method: string;
  path: string;
  status_code: number;
  request_body: string;
  response_body: string;
  ip_address: string;
  duration_ms: number;
  request_id: string;
  logged_at: string;
}

interface Meta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

interface LogState {
  logs: Log[];
  meta: Meta | null;
  isLoading: boolean;
  fetchLogs: (page?: number) => Promise<void>;
  clearLogs: () => Promise<void>;
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  meta: null,
  isLoading: false,

  fetchLogs: async (page = 1) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "30",
      });

      const response = await api.get(`/control/logs?${params}`);
      set({
        logs: response.data.data.logs,
        meta: response.data.data.meta,
      });
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearLogs: async () => {
    await api.delete("/control/logs");
    await get().fetchLogs(1);
  },
}));
