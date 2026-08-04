import { STORAGE_KEYS } from "./constants";
import { fetchAuthMe, getAuthMe, AuthMeResponse } from "./api-config";

export { fetchAuthMe, getAuthMe };
export type { AuthMeResponse };

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true; // Non-JWT string, valid if present
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }
    return true;
  } catch (e) {
    return true;
  }
}

export function checkIsAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = getStoredToken();
  return isTokenValid(token);
}
