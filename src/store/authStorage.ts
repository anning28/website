export type AuthUser = {
  id?: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoredAuth = {
  token: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = 'website.auth';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStoredAuth(value: unknown): value is StoredAuth {
  return (
    isRecord(value) &&
    typeof value.token === 'string' &&
    isRecord(value.user) &&
    typeof value.user.email === 'string'
  );
}

export function readStoredAuth() {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!isStoredAuth(parsedValue)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsedValue;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeStoredAuth(auth: StoredAuth) {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}
