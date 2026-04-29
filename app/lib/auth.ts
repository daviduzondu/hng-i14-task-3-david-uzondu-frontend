import { BASE_URL } from "./api";
import api from "./api";

export interface CurrentUser {
  id: string;
  username: string;
  role: "admin" | "analyst";
  is_active: boolean;
  avatar_url: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function clearOAuthStorage(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem("oauth_state");
  sessionStorage.removeItem("oauth_code_verifier");
  sessionStorage.removeItem("oauth_code_challenge");
  sessionStorage.removeItem("oauth_code_challenge_method");
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  if (!isBrowser()) return null;

  try {
    const response = await api.get<{ status: string; data: CurrentUser }>(
      `${BASE_URL}/api/users/me`
    );

    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  if (!isBrowser()) return;

  try {
    await api.post(`${BASE_URL}/auth/logout`);
  } catch {
    // Ignore errors
  } finally {
    clearOAuthStorage();
  }
}