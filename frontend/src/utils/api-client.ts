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

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.__ENV__?.API_BASE_URL ?? '/api/v1';
  }
  return process.env.VITE_API_BASE_URL ?? '/api/v1';
}

export async function apiClient<TResponse>(
  path: string,
  { auth = true, headers, ...init }: ApiClientOptions = {}
): Promise<TResponse> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;

  const requestHeaders: HeadersInit = {
    ...defaultHeaders,
    ...headers,
  };

  if (auth) {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token') ??
          document.cookie
            .split(';')
            .map(item => item.trim())
            .find(item => item.startsWith('sb-access-token='))
            ?.split('=')[1] ??
          undefined
        : process.env.TEST_ACCESS_TOKEN;

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: requestHeaders,
  });

  const contentType = response.headers.get('content-type');
  const payload =
    contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload
        ? (payload as { error: { message?: string } }).error?.message ??
          'Unexpected error'
        : response.statusText;
    throw new ApiError(message, response.status, payload);
  }

  return payload as TResponse;
}


