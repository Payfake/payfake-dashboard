import { api } from "./api";

interface Merchant {
  id: string;
  business_name: string;
  email: string;
  public_key: string;
}

interface LoginResponse {
  data: {
    merchant: Merchant;
    token: string;
  };
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await api.post("/auth/login", { email, password });
  const { token } = response.data.data;
  localStorage.setItem("payfake_token", token);
  localStorage.setItem(
    "payfake_merchant",
    JSON.stringify(response.data.data.merchant),
  );
  return response.data;
}

export async function register(
  business_name: string,
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await api.post("/auth/register", {
    business_name,
    email,
    password,
  });
  const { token } = response.data.data;
  localStorage.setItem("payfake_token", token);
  localStorage.setItem(
    "payfake_merchant",
    JSON.stringify(response.data.data.merchant),
  );
  return response.data;
}

export function logout() {
  localStorage.removeItem("payfake_token");
  localStorage.removeItem("payfake_merchant");
  window.location.href = "/login";
}

export function getMerchant(): Merchant | null {
  const merchant = localStorage.getItem("payfake_merchant");
  return merchant ? JSON.parse(merchant) : null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("payfake_token");
}
