import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  username: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AUTH_STORAGE_KEY = 'website.auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

export function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState(readStoredAuth);

  const login = useCallback((username: string, password: string) => {
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      return false;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ username: normalizedUsername }),
    );
    setAuthState({ isAuthenticated: true, username: normalizedUsername });

    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({ isAuthenticated: false, username: '' });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      username: authState.username,
      login,
      logout,
    }),
    [authState.isAuthenticated, authState.username, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
