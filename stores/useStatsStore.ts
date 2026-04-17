import { create } from "zustand";
import { api } from "@/lib/api";

interface DailyActivity {
  date: string;
  count: number;
  volume: number;
}

interface Stats {
  transactions: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    abandoned: number;
    success_rate: number;
  };
  volume: {
    total_amount: number;
  };
  customers: {
    total: number;
  };
  webhooks: {
    total: number;
    delivered: number;
    failed: number;
  };
  daily_activity: DailyActivity[];
}

interface StatsState {
  stats: Stats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/control/stats");
      set({ stats: response.data.data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
