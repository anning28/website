import { create } from 'zustand';

type AuthState = {
  isAuthenticated: boolean;
  username: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AUTH_STORAGE_KEY = 'website.auth';

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

export const useAuthStore = create<AuthState>((set) => ({
  ...readStoredAuth(),
  login: (username, password) => {
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      return false;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ username: normalizedUsername }),
    );
    set({ isAuthenticated: true, username: normalizedUsername });

    return true;
  },
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ isAuthenticated: false, username: '' });
  },
}));
