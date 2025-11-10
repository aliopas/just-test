export type SessionLike = {
  accessToken?: string;
  refreshToken?: string;
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function storeSessionTokens(session?: SessionLike): void {
  if (!canUseStorage() || !session) {
    return;
  }

  if (session.accessToken) {
    window.localStorage.setItem('access_token', session.accessToken);
  }

  if (session.refreshToken) {
    window.localStorage.setItem('refresh_token', session.refreshToken);
  }
}

export function getStoredRefreshToken(): string | undefined {
  if (!canUseStorage()) {
    return undefined;
  }

  const token = window.localStorage.getItem('refresh_token');
  return token ?? undefined;
}

