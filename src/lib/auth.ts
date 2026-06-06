const TOKEN_KEY = "mindcheck_access_token";
const USER_KEY = "mindcheck_user";

export interface AuthUser {
  id: string;
  email: string;
  nombre?: string;
  foto_perfil?: string | null;
  rol: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function updateAuthUser(updates: Partial<AuthUser>): void {
  const user = getAuthUser();
  if (user) {
    const updated = { ...user, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
