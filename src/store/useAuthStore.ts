import { create } from 'zustand';

type AuthState = {
  isAuthenticated: boolean;
  username: string;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => RegisterResult;
  logout: () => void;
};

type RegisterResult = 'success' | 'exists' | 'invalid';

type StoredAccount = {
  username: string;
  password: string;
};

const AUTH_STORAGE_KEY = 'website.auth';
const ACCOUNT_STORAGE_KEY = 'website.accounts';

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function normalizePassword(password: string) {
  return password.trim();
}

function readStoredAuth() {
  try {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return { isAuthenticated: false, username: '' };
    }

    const parsedValue = JSON.parse(rawValue) as { username?: string };

    return {
      isAuthenticated: Boolean(parsedValue.username),
      username: parsedValue.username ?? '',
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return { isAuthenticated: false, username: '' };
  }
}

function readStoredAccounts() {
  try {
    const rawValue = localStorage.getItem(ACCOUNT_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (account): account is StoredAccount =>
        typeof account?.username === 'string' &&
        typeof account?.password === 'string',
    );
  } catch {
    localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    return [];
  }
}

function writeStoredAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
}

function persistAuth(username: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ username }));
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readStoredAuth(),
  login: (username, password) => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedPassword = normalizePassword(password);

    if (!normalizedUsername || !normalizedPassword) {
      return false;
    }

    const account = readStoredAccounts().find(
      (storedAccount) =>
        storedAccount.username === normalizedUsername &&
        storedAccount.password === normalizedPassword,
    );

    if (!account) {
      return false;
    }

    persistAuth(normalizedUsername);
    set({ isAuthenticated: true, username: normalizedUsername });

    return true;
  },
  register: (username, password) => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedPassword = normalizePassword(password);

    if (!normalizedUsername || !normalizedPassword) {
      return 'invalid';
    }

    const accounts = readStoredAccounts();
    const hasAccount = accounts.some(
      (account) => account.username === normalizedUsername,
    );

    if (hasAccount) {
      return 'exists';
    }

    writeStoredAccounts([
      ...accounts,
      { username: normalizedUsername, password: normalizedPassword },
    ]);
    persistAuth(normalizedUsername);
    set({ isAuthenticated: true, username: normalizedUsername });

    return 'success';
  },
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ isAuthenticated: false, username: '' });
  },
}));
