import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const AUTH_API_URL = 'https://functions.poehali.dev/dc13fdd2-eb59-4658-8080-4ab0c13a84af';

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
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('auth_token');
    console.log('[AuthContext] Проверка токена:', storedToken?.substring(0, 30) + '...');
    
    if (!storedToken) {
      console.log('[AuthContext] Токен не найден');
      setLoading(false);
      return;
    }

    try {
      // Пробуем декодировать JWT токен локально
      const parts = storedToken.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('[AuthContext] JWT payload:', payload);
          
          // Проверяем, не истек ли токен
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            console.log('[AuthContext] Токен действителен до:', new Date(payload.exp * 1000));
            // Если есть user_id в токене, значит это Telegram JWT
            if (payload.user_id) {
              // Для Telegram авторизации используем данные из localStorage
              const telegramUser = localStorage.getItem('telegram_user');
              console.log('[AuthContext] Telegram user из localStorage:', telegramUser);
              if (telegramUser) {
                setUser(JSON.parse(telegramUser));
                setToken(storedToken);
                setLoading(false);
                console.log('[AuthContext] Сессия восстановлена');
                return;
              }
            }
          } else {
            // Токен истек
            console.log('[AuthContext] Токен истек');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('telegram_user');
            localStorage.removeItem('telegram_auth_refresh_token');
            setToken(null);
            setUser(null);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.log('[AuthContext] Ошибка декодирования JWT:', e);
          // Не JWT токен, продолжаем проверку через API
        }
      }

      // Старый способ проверки через API для email-авторизации
      const response = await fetch(AUTH_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(storedToken);
      } else {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка входа');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string, telegram?: string) => {
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          name,
          phone,
          telegram
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка регистрации');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(AUTH_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'logout' })
        });
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};