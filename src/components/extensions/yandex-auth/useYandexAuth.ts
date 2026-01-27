/**
 * Yandex Auth Extension - useYandexAuth Hook
 *
 * React hook for Yandex OAuth authentication.
 */
import { useState, useCallback, useEffect, useRef } from "react";

// =============================================================================
// TYPES
// =============================================================================

const REFRESH_TOKEN_KEY = "yandex_auth_refresh_token";
const STATE_KEY = "yandex_auth_state";

export interface User {
  id: number;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  yandex_id: string;
}

interface AuthApiUrls {
  authUrl: string;
  callback: string;
  refresh: string;
  logout: string;
}

interface UseYandexAuthOptions {
  apiUrls: AuthApiUrls;
  onAuthChange?: (user: User | null) => void;
  autoRefresh?: boolean;
  refreshBeforeExpiry?: number;
}

interface UseYandexAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  login: () => Promise<void>;
  handleCallback: (urlParams?: URLSearchParams) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getAuthHeader: () => { Authorization: string } | {};
}

// =============================================================================
// LOCAL STORAGE
// =============================================================================

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setStoredRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function clearStoredRefreshToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function setStoredState(state: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STATE_KEY, state);
}

function getStoredState(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STATE_KEY);
}

function clearStoredState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STATE_KEY);
}

// =============================================================================
// HOOK
// =============================================================================

export function useYandexAuth(options: UseYandexAuthOptions): UseYandexAuthReturn {
  const {
    apiUrls,
    onAuthChange,
    autoRefresh = true,
    refreshBeforeExpiry = 60,
  } = options;

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAuth = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    setAccessToken(null);
    setUser(null);
    clearStoredRefreshToken();
    clearStoredState();
  }, []);

  const scheduleRefresh = useCallback(
    (expiresInSeconds: number, refreshFn: () => Promise<boolean>) => {
      if (!autoRefresh) return;

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const refreshIn = Math.max((expiresInSeconds - refreshBeforeExpiry) * 1000, 1000);

      refreshTimerRef.current = setTimeout(async () => {
        const success = await refreshFn();
        if (!success) {
          clearAuth();
        }
      }, refreshIn);
    },
    [autoRefresh, refreshBeforeExpiry, clearAuth]
  );

  const refreshTokenFn = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) {
      return false;
    }

    try {
      const response = await fetch(apiUrls.refresh, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        scheduleRefresh(data.expires_in, refreshTokenFn);
      }
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [apiUrls.refresh, clearAuth, scheduleRefresh]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const hasToken = !!getStoredRefreshToken();
      if (hasToken) {
        await refreshTokenFn();
      }
      setIsLoading(false);
    };

    restoreSession();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [refreshTokenFn]);

  // Notify on auth change
  useEffect(() => {
    onAuthChange?.(user);
  }, [user, onAuthChange]);

  /**
   * Start Yandex login flow - redirects to Yandex
   */
  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrls.authUrl, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to get auth URL");
        setIsLoading(false);
        return;
      }

      // Store state for callback
      if (typeof window !== "undefined" && data.state) {
        setStoredState(data.state);
      }

      // Redirect to Yandex (keep loading state, page will navigate away)
      window.location.href = data.auth_url;
    } catch (err) {
      setError("Network error");
      setIsLoading(false);
    }
  }, [apiUrls.authUrl]);

  /**
   * Handle OAuth callback - exchange code for tokens
   * @param urlParams - Optional URLSearchParams, defaults to current URL
   */
  const handleCallback = useCallback(
    async (urlParams?: URLSearchParams): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = urlParams || new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        console.log('[useYandexAuth] handleCallback вызван, code:', code?.substring(0, 20) + '...', 'state:', state?.substring(0, 20) + '...');

        if (!code) {
          console.error('[useYandexAuth] Нет authorization code');
          setError("No authorization code received");
          return false;
        }

        // Verify state for CSRF protection
        const storedState = getStoredState();
        if (storedState && state !== storedState) {
          console.error('[useYandexAuth] State не совпадает. stored:', storedState?.substring(0, 20), 'received:', state?.substring(0, 20));
          setError("Invalid state parameter");
          return false;
        }

        console.log('[useYandexAuth] Отправляю POST запрос на:', apiUrls.callback);
        const response = await fetch(apiUrls.callback, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        console.log('[useYandexAuth] Ответ от backend:', response.status, response.statusText);
        const data = await response.json();
        console.log('[useYandexAuth] Данные от backend:', {
          hasAccessToken: !!data.access_token,
          accessTokenStart: data.access_token?.substring(0, 30) + '...',
          hasRefreshToken: !!data.refresh_token,
          hasUser: !!data.user,
          expiresIn: data.expires_in,
          error: data.error
        });

        if (!response.ok) {
          console.error('[useYandexAuth] Backend вернул ошибку:', data.error);
          setError(data.error || "Authentication failed");
          return false;
        }

        // Clear temporary storage
        clearStoredState();

        // Set auth data and save to unified storage
        console.log('[useYandexAuth] Устанавливаю access_token и user в state');
        setAccessToken(data.access_token);
        setUser(data.user);
        setStoredRefreshToken(data.refresh_token);
        
        // Save to cookies and localStorage for unified auth system
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.access_token);
          document.cookie = `auth_token=${data.access_token}; path=/; max-age=900`;
        }
        
        scheduleRefresh(data.expires_in, refreshTokenFn);
        console.log('[useYandexAuth] Авторизация успешна!');
        return true;
      } catch (err) {
        console.error('[useYandexAuth] Ошибка в handleCallback:', err);
        setError("Network error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrls.callback, scheduleRefresh, refreshTokenFn]
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    const storedRefreshToken = getStoredRefreshToken();

    try {
      await fetch(apiUrls.logout, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: storedRefreshToken || "" }),
      });
    } catch {
      // Ignore errors
    }

    clearAuth();
  }, [apiUrls.logout, clearAuth]);

  /**
   * Get Authorization header for API requests
   */
  const getAuthHeader = useCallback(() => {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
  }, [accessToken]);

  return {
    user,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    error,
    accessToken,
    login,
    handleCallback,
    logout,
    refreshToken: refreshTokenFn,
    getAuthHeader,
  };
}

export default useYandexAuth;