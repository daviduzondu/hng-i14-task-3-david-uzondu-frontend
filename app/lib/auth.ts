import { BASE_URL } from "./api";

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

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  if (!isBrowser()) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data as CurrentUser;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  if (!isBrowser()) return;

  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore errors
  }
}