import { getStoredAccessToken } from './auth-token';
import { storeSessionTokens, getStoredRefreshToken } from './session-storage';
import { getSupabaseBrowserClient } from './supabase-client';

export interface ApiClientOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

function applyHeaders(target: Headers, source?: HeadersInit) {
  if (!source) return;
  if (source instanceof Headers) {
    source.forEach((value, key) => target.set(key, value));
    return;
  }
  if (Array.isArray(source)) {
    source.forEach(([key, value]) => target.set(key, value));
    return;
  }
  Object.entries(source).forEach(([key, value]) => {
    target.set(key, String(value));
  });
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.__ENV__?.API_BASE_URL ?? '/api/v1';
  }
  // Next.js environment variable
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';
}

type RefreshResponse = {
  session?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const baseUrl = getBaseUrl();
        const storedRefreshToken = getStoredRefreshToken();
        
        if (!storedRefreshToken) {
          console.warn('No refresh token available for refresh');
          return false;
        }
        
        const response = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: storedRefreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const contentType = response.headers.get('content-type');
        const payload: RefreshResponse =
          contentType && contentType.includes('application/json')
            ? ((await response.json()) as RefreshResponse)
            : {};

        const accessToken = payload.session?.accessToken;
        const refreshToken = payload.session?.refreshToken ?? storedRefreshToken;

        if (!accessToken) {
          return false;
        }

        storeSessionTokens({
          accessToken,
          refreshToken,
        });

        const supabase = getSupabaseBrowserClient();
        if (supabase && refreshToken) {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          } catch (error) {
            console.warn(
              'Failed to hydrate Supabase client session after refresh',
              error
            );
          }
        }

        return true;
      } catch (error) {
        console.error('Failed to refresh access token:', error);
        return false;
      }
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function resolveAccessToken(): string | undefined {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_TEST_ACCESS_TOKEN;
  }
  return getStoredAccessToken();
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

export async function apiClient<TResponse>(
  path: string,
  { auth = true, headers, ...init }: ApiClientOptions = {}
): Promise<TResponse> {
  // Prevent API calls during SSR - they should only happen on the client
  // This is a safety guard in case apiClient is called directly during SSR
  if (typeof window === 'undefined') {
    throw new ApiError(
      'API calls are not supported during server-side rendering. Use client-side hooks instead.',
      0,
      { path }
    );
  }

  const baseUrl = getBaseUrl();
  // Remove any duplicate /api/v1 prefix from path if it exists
  const cleanPath = path.replace(/^\/api\/v1\//, '/');
  const url = cleanPath.startsWith('http') ? cleanPath : `${baseUrl}${cleanPath}`;

  const createHeaders = () => {
    const requestHeaders = new Headers(defaultHeaders);
    applyHeaders(requestHeaders, headers);

    if (auth) {
      const token = resolveAccessToken();
      if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
      }
    }

    return requestHeaders;
  };

  const executeRequest = () =>
    fetch(url, {
      credentials: 'include',
      ...init,
      headers: createHeaders(),
    });

  let response = await executeRequest();

  if (response.status === 401 && auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await executeRequest();
    }
  }

  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    let message: string;
    
    // Try to extract error message from payload
    if (typeof payload === 'object' && payload !== null) {
      if ('error' in (payload as Record<string, unknown>)) {
        const errorObj = (payload as { error?: { message?: string; code?: string } }).error;
        message = errorObj?.message ?? 'Unexpected error';
        
        // Include error code if available for better debugging
        if (errorObj?.code) {
          message = `[${errorObj.code}] ${message}`;
        }
      } else if ('message' in (payload as Record<string, unknown>)) {
        message = String((payload as { message?: unknown }).message ?? 'Unexpected error');
      } else {
        message = response.statusText || 'Request failed';
      }
    } else if (typeof payload === 'string') {
      message = payload;
    } else {
      message = response.statusText || 'Request failed';
    }

    // Include URL and status in error message for debugging
    const errorMessage = `${message} (${response.status} ${response.statusText}) - ${url}`;
    
    throw new ApiError(errorMessage, response.status, payload);
  }

  return payload as TResponse;
}


