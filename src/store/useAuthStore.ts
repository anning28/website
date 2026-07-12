import { create } from 'zustand';

import { clearAuthToken, setAuthToken } from '../api/authToken';
import { loginApi, registerApi, type AuthResponse, type AuthUser } from '../api/auth';

type AuthState = {
  isAuthenticated: boolean;
  username: string;
  token: string;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function normalizePassword(password: string) {
  return password.trim();
}

function getAuthState(auth: AuthResponse | null) {
  return {
    isAuthenticated: Boolean(auth?.token && auth.user.email),
    username: auth?.user.email ?? '',
    token: auth?.token ?? '',
    user: auth?.user ?? null,
  };
}

function applyAuth(auth: AuthResponse) {
  setAuthToken(auth.token);
  return getAuthState(auth);
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getAuthState(null),
  login: async (username, password) => {
    const auth = await loginApi({
      email: normalizeUsername(username),
      password: normalizePassword(password),
    });

    set(applyAuth(auth));
  },
  register: async (username, password) => {
    const auth = await registerApi({
      email: normalizeUsername(username),
      password: normalizePassword(password),
    });

    set(applyAuth(auth));
  },
  logout: () => {
    clearAuthToken();
    set(getAuthState(null));
  },
}));
