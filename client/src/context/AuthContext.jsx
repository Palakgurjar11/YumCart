import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import api, { attachAuthInterceptors } from '../api/client.js';

/** Browser token key — swapping to HttpOnly cookies is a straightforward hardening step */
const TOKEN_KEY = 'yumcart_token';
const USER_KEY = 'yumcart_user_snapshot';

const AuthContext = createContext(null);

/** Auth state lifted to Context so Navbar + guarded routes react consistently */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const snap = localStorage.getItem(USER_KEY);
      return snap ? JSON.parse(snap) : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  /** Central Axios JWT wiring — attaches once without capturing stale closures */
  useEffect(() => {
    attachAuthInterceptors(
      () => localStorage.getItem(TOKEN_KEY),
      () => logoutRef.current()
    );
  }, []);

  /** Fetch fresh profile whenever token restores — invalid tokens clear session */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await api.get('/auth/me', {
          skipErrorToast: true,
          skipAuthLogout: true,
        });
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } catch {
        /** JWT invalid — clear persisted session gracefully */
        logout();
      }
    })();
  }, [logout, token]);

  const persistSession = useCallback((tokenValue, userSnapshot) => {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userSnapshot));
    setToken(tokenValue);
    setUser(userSnapshot);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials, {
        skipErrorToast: true,
        skipAuthLogout: true,
      });
      if (!data.success) throw new Error(data.message);
      persistSession(data.token, data.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/register', payload, {
        skipErrorToast: true,
        skipAuthLogout: true,
      });
      if (!data.success) throw new Error(data.message);
      persistSession(data.token, data.user);
    },
    [persistSession]
  );

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, logout, login, register, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
