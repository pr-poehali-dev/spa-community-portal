import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

const AUTH_API_URL = 'https://functions.poehali.dev/fdba6fa3-4998-4f82-ac05-2dd07a9acac3';

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
  const [token, setToken] = useState<string | null>(
    Cookies.get('auth_token') || localStorage.getItem('auth_token')
  );
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const storedToken = Cookies.get('auth_token') || localStorage.getItem('auth_token');
    console.log('[AuthContext] Проверка токена:', storedToken?.substring(0, 30) + '...');
    
    if (!storedToken) {
      console.log('[AuthContext] Токен не найден');
      setLoading(false);
      return;
    }

    try {
      // Пробуем декодировать JWT токен локально
      const parts = storedToken.split('.');
      if (parts.length === 3 && parts[1]) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('[AuthContext] JWT payload:', payload);
          
          // Проверяем, не истек ли токен
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            console.log('[AuthContext] Токен действителен до:', new Date(payload.exp * 1000));
            
            // Если есть user_id и email - это email-auth токен
            if (payload.user_id && payload.email) {
              setUser({
                id: payload.user_id,
                email: payload.email,
                name: payload.name || '',
                role: 'participant' as any
              });
              setToken(storedToken);
              setLoading(false);
              console.log('[AuthContext] Email-auth сессия восстановлена');
              return;
            }
            
            // Если есть user_id но нет email - это Telegram JWT
            if (payload.user_id) {
              const telegramUser = Cookies.get('telegram_user') || localStorage.getItem('telegram_user');
              console.log('[AuthContext] Telegram user из хранилища:', telegramUser);
              if (telegramUser) {
                setUser(JSON.parse(telegramUser));
                setToken(storedToken);
                setLoading(false);
                console.log('[AuthContext] Telegram сессия восстановлена');
                return;
              }
            }
          } else {
            // Токен истек
            console.log('[AuthContext] Токен истек');
            Cookies.remove('auth_token');
            Cookies.remove('telegram_user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('telegram_user');
            localStorage.removeItem('telegram_auth_refresh_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setToken(null);
            setUser(null);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.log('[AuthContext] Ошибка декодирования JWT, очищаем токен:', e);
          // Не JWT токен или невалидный формат - очищаем
        }
      }
      
      // Если дошли сюда - токен невалиден
      console.log('[AuthContext] Токен невалиден, очищаем сессию');
      Cookies.remove('auth_token');
      Cookies.remove('telegram_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('telegram_user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      Cookies.remove('auth_token');
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
      const response = await fetch(`${AUTH_API_URL}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка входа');
      }

      const data = await response.json();
      // Сохраняем токен в cookies на 30 дней
      Cookies.set('auth_token', data.token, { expires: 30, sameSite: 'lax' });
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string, telegram?: string) => {
    try {
      const response = await fetch(`${AUTH_API_URL}?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка регистрации');
      }

      const data = await response.json();
      // Сохраняем токены в cookies на 30 дней
      Cookies.set('auth_token', data.access_token, { expires: 30, sameSite: 'lax' });
      Cookies.set('refresh_token', data.refresh_token, { expires: 30, sameSite: 'lax' });
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${AUTH_API_URL}?action=logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({})
        });
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      Cookies.remove('auth_token');
      Cookies.remove('refresh_token');
      Cookies.remove('telegram_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('telegram_user');
      localStorage.removeItem('telegram_auth_refresh_token');
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