import type { Credentials, Role } from "../types";

const CREDENTIALS_KEY = "insighta_credentials";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveCredentials(credentials: Credentials): void {
  if (!isBrowser()) return;
  localStorage.setItem("access_token", credentials.access_token);
  localStorage.setItem("refresh_token", credentials.refresh_token);
  localStorage.setItem("username", credentials.username);
  localStorage.setItem("role", credentials.role);
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function loadCredentials(): Credentials | null {
  if (!isBrowser()) return null;
  const stored = localStorage.getItem(CREDENTIALS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  if (!isBrowser()) return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem(CREDENTIALS_KEY);
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem("refresh_token");
}

export function getUsername(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem("username");
}

export function getRole(): Role | null {
  if (!isBrowser()) return null;
  const role = localStorage.getItem("role");
  return role as Role | null;
}

export function isAuthenticated(): boolean {
  if (!isBrowser()) return false;
  return !!localStorage.getItem("access_token");
}