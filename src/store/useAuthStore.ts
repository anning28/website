import { create } from 'zustand';

import { loginApi, registerApi } from '../api/auth';
import {
  clearStoredAuth,
  readStoredAuth,
  type AuthUser,
  type StoredAuth,
  writeStoredAuth,
} from './authStorage';

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

function getAuthState(auth: StoredAuth | null) {
  return {
    isAuthenticated: Boolean(auth?.token && auth.user.email),
    username: auth?.user.email ?? '',
    token: auth?.token ?? '',
    user: auth?.user ?? null,
  };
}

function persistAuth(auth: StoredAuth) {
  writeStoredAuth(auth);
  return getAuthState(auth);
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getAuthState(readStoredAuth()),
  login: async (username, password) => {
    const auth = await loginApi({
      email: normalizeUsername(username),
      password: normalizePassword(password),
    });

    set(persistAuth(auth));
  },
  register: async (username, password) => {
    const auth = await registerApi({
      email: normalizeUsername(username),
      password: normalizePassword(password),
    });

    set(persistAuth(auth));
  },
  logout: () => {
    clearStoredAuth();
    set(getAuthState(null));
  },
}));
