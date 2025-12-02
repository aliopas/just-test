export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    if (typeof window === 'undefined' || typeof window.atob !== 'function') {
      return null;
    }
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const decoded = window.atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getStoredAccessToken(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const fromLocalStorage = window.localStorage?.getItem('access_token');
  if (fromLocalStorage) {
    return fromLocalStorage;
  }

  const cookieToken = document.cookie
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith('sb-access-token='))
    ?.split('=')[1];

  return cookieToken ?? undefined;
}

export function getCurrentUserIdFromToken(): string | undefined {
  const token = getStoredAccessToken();
  if (!token) {
    return undefined;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return undefined;
  }

  if (typeof payload.sub === 'string' && payload.sub.length > 0) {
    return payload.sub;
  }

  if (typeof payload.user_id === 'string' && payload.user_id.length > 0) {
    return payload.user_id;
  }

  if (typeof payload.id === 'string' && payload.id.length > 0) {
    return payload.id;
  }

  return undefined;
}

