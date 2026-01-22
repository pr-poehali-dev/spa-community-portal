import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYandexAuth } from '@/components/extensions/yandex-auth/useYandexAuth';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';

const YANDEX_AUTH_URL = 'https://functions.poehali.dev/ecb56210-8c2b-4f4e-aa4b-b5b742d25f6a';

const YandexCallbackPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const yandexAuth = useYandexAuth({
    apiUrls: {
      authUrl: `${YANDEX_AUTH_URL}?action=auth-url`,
      callback: `${YANDEX_AUTH_URL}?action=callback`,
      refresh: `${YANDEX_AUTH_URL}?action=refresh`,
      logout: `${YANDEX_AUTH_URL}?action=logout`,
    },
    onAuthChange: async (user) => {
      if (user) {
        await checkAuth();
        navigate('/account', { replace: true });
      }
    }
  });

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        console.log('[YandexCallback] Начало обработки callback, params:', params.toString());
        
        const success = await yandexAuth.handleCallback(params);
        console.log('[YandexCallback] Результат handleCallback:', success);
        console.log('[YandexCallback] Access token:', yandexAuth.accessToken?.substring(0, 30) + '...');
        console.log('[YandexCallback] User:', yandexAuth.user);
        
        if (success && yandexAuth.accessToken) {
          console.log('[YandexCallback] Сохраняю токен в cookies и localStorage');
          Cookies.set('auth_token', yandexAuth.accessToken, { expires: 30, sameSite: 'lax' });
          localStorage.setItem('auth_token', yandexAuth.accessToken);
          
          if (yandexAuth.user) {
            Cookies.set('yandex_user', JSON.stringify(yandexAuth.user), { expires: 30, sameSite: 'lax' });
            localStorage.setItem('yandex_user', JSON.stringify(yandexAuth.user));
            console.log('[YandexCallback] Данные пользователя сохранены');
          }
          
          console.log('[YandexCallback] Вызываю checkAuth()');
          await checkAuth();
          console.log('[YandexCallback] Переход на /account');
          navigate('/account', { replace: true });
        } else {
          console.error('[YandexCallback] success или accessToken false/null');
          setError('Ошибка авторизации через Яндекс');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      } catch (err) {
        console.error('[YandexCallback] Ошибка:', err);
        setError('Произошла ошибка при авторизации');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{error}</h2>
          <p className="text-muted-foreground">Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 animate-pulse">
          <svg className="w-8 h-8 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Авторизация через Яндекс</h2>
        <p className="text-muted-foreground">Пожалуйста, подождите...</p>
      </div>
    </div>
  );
};

export default YandexCallbackPage;