import { create } from "zustand";
import { api } from "@/lib/api";

interface Merchant {
  id: string;
  business_name: string;
  email: string;
  public_key: string;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    businessName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchMerchant: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  merchant: null,
  isAuthenticated: false,
  isLoading: true,

  setLoading: (loading) => set({ isLoading: loading }),

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    set({ isAuthenticated: true });
    await get().fetchMerchant();
  },

  register: async (businessName, email, password) => {
    const response = await api.post("/auth/register", {
      business_name: businessName,
      email,
      password,
    });
    set({ isAuthenticated: true });
    await get().fetchMerchant();
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ merchant: null, isAuthenticated: false });
  },

  fetchMerchant: async () => {
    try {
      const response = await api.get("/auth/me");
      set({ merchant: response.data.data, isAuthenticated: true });
    } catch {
      set({ merchant: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
