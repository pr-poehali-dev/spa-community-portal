import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const AUTH_API_URL = 'https://functions.poehali.dev/5e8337ff-5f62-4937-8929-47c5902da077';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  telegram?: string;
  role: 'participant' | 'master' | 'partner' | 'organizer' | 'editor';
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string, telegram?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: (forceReload?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple storage helpers - ONLY localStorage, NO cookies
const getToken = () => localStorage.getItem('auth_token');
const setTokenStorage = (token: string) => localStorage.setItem('auth_token', token);
const clearTokenStorage = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);

  const checkAuth = async (forceReload = false) => {
    const storedToken = getToken();
    
    if (!storedToken) {
      setLoading(false);
      setToken(null);
      setUser(null);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_URL}?action=me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(storedToken);
        console.log('[Auth] Session restored', forceReload ? '(force reload)' : '');
      } else {
        clearTokenStorage();
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Check failed:', error);
      clearTokenStorage();
      setToken(null);
      setUser(null);
    }

    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${AUTH_API_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setTokenStorage(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string, phone?: string, telegram?: string) => {
    const response = await fetch(`${AUTH_API_URL}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone, telegram })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setTokenStorage(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    clearTokenStorage();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};