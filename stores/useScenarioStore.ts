import { create } from "zustand";
import { api } from "@/lib/api";

interface Scenario {
  id: string;
  merchant_id: string;
  failure_rate: number;
  delay_ms: number;
  force_status: string;
  error_code: string;
  is_active: boolean;
}

interface ScenarioState {
  scenario: Scenario | null;
  isLoading: boolean;
  fetchScenario: () => Promise<void>;
  updateScenario: (updates: Partial<Scenario>) => Promise<void>;
  resetScenario: () => Promise<void>;
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  scenario: null,
  isLoading: false,

  fetchScenario: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/control/scenario");
      set({ scenario: response.data.data });
    } catch (error) {
      console.error("Failed to fetch scenario:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateScenario: async (updates: Partial<Scenario>) => {
    await api.put("/control/scenario", updates);
    await get().fetchScenario();
  },

  resetScenario: async () => {
    await api.post("/control/scenario/reset");
    await get().fetchScenario();
  },
}));
