"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchMerchant, isLoading } = useAuthStore();

  useEffect(() => {
    fetchMerchant();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return <>{children}</>;
}
