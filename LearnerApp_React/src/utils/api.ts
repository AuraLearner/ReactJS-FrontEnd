const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://auralearnerapi.azaken.com';

const DEFAULT_ML_BASE_URL =
  import.meta.env.VITE_ML_BASE_URL ?? 'https://auralearnerai.azaken.com';

type RequestBody = BodyInit | Record<string, unknown> | null | undefined;

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: RequestBody;
  headers?: HeadersInit;
}

function buildUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).toString();
}

function isBodyInit(value: RequestBody): value is BodyInit {
  return (
    value instanceof FormData ||
    value instanceof Blob ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

export function getStoredToken(): string {
  return localStorage.getItem('token') ?? '';
}

export function getStoredRole(): string {
  return localStorage.getItem('role') ?? '';
}

export function getStoredUserId(): number | null {
  const rawUserId = localStorage.getItem('userId');

  if (!rawUserId) {
    return null;
  }

  const parsedUserId = Number(rawUserId);

  return Number.isFinite(parsedUserId) ? parsedUserId : null;
}

export function setAuthSession(token: string, role?: string, userId?: number): void {
  localStorage.setItem('token', token);

  if (role) {
    localStorage.setItem('role', role);
  } else {
    localStorage.removeItem('role');
  }

  if (userId != null) {
    localStorage.setItem('userId', String(userId));
  } else {
    localStorage.removeItem('userId');
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('rememberedRole');
}

function buildHeaders(headers?: HeadersInit): Headers {
  const requestHeaders = new Headers(headers);
  const token = getStoredToken();

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  return requestHeaders;
}

function buildBody(body: RequestBody, headers: Headers): BodyInit | undefined {
  if (body == null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function request<T>(baseUrl: string, path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = buildHeaders(options.headers);
  const response = await fetch(buildUrl(baseUrl, path), {
    ...options,
    headers,
    body: buildBody(options.body, headers),
  });

  if (!response.ok) {
    const errorBody = await parseResponse<unknown>(response);

    if (typeof errorBody === 'string' && errorBody.trim()) {
      throw new Error(errorBody);
    }

    if (errorBody && typeof errorBody === 'object' && 'message' in errorBody) {
      throw new Error(String((errorBody as Record<string, unknown>).message));
    }

    throw new Error(`Request failed with status ${response.status}`);
  }

  return parseResponse<T>(response);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return request<T>(DEFAULT_API_BASE_URL, path, options);
}

export async function mlRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return request<T>(DEFAULT_ML_BASE_URL, path, options);
}
