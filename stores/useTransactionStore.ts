import { create } from "zustand";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "abandoned" | "reversed";
  channel: string;
  fees: number;
  paid_at: string | null;
  created_at: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    customer_code: string;
  };
}

interface Meta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

interface TransactionState {
  transactions: Transaction[];
  meta: Meta | null;
  isLoading: boolean;
  fetchTransactions: (page?: number, status?: string) => Promise<void>;
  refundTransaction: (id: string) => Promise<void>;
  forceTransaction: (
    reference: string,
    status: string,
    errorCode?: string,
  ) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  meta: null,
  isLoading: false,

  fetchTransactions: async (page = 1, status = "") => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
      });
      if (status) params.append("status", status);

      const response = await api.get(`/control/transactions?${params}`);
      set({
        transactions: response.data.data.transactions,
        meta: response.data.data.meta,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refundTransaction: async (id: string) => {
    await api.post(`/transaction/${id}/refund`);
    await get().fetchTransactions(get().meta?.page || 1);
  },

  forceTransaction: async (
    reference: string,
    status: string,
    errorCode?: string,
  ) => {
    await api.post(`/control/transactions/${reference}/force`, {
      status,
      error_code: errorCode,
    });
    await get().fetchTransactions(get().meta?.page || 1);
  },
}));
