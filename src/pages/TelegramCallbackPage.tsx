import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTelegramAuth } from '@/components/extensions/telegram-bot/useTelegramAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Cookies from 'js-cookie';

const TELEGRAM_AUTH_URL = 'https://functions.poehali.dev/dc3fb91d-b358-49d4-8739-e624e705ab71';
const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'SparcomAuth_bot';

const TelegramCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { checkAuth } = useAuth();

  const telegramAuth = useTelegramAuth({
    apiUrls: {
      callback: `${TELEGRAM_AUTH_URL}?action=callback`,
      refresh: `${TELEGRAM_AUTH_URL}?action=refresh`,
      logout: `${TELEGRAM_AUTH_URL}?action=logout`,
    },
    botUsername: TELEGRAM_BOT_USERNAME,
  });

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Токен авторизации не найден');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    let cancelled = false;

    const authenticate = async () => {
      try {
        // Вызываем API напрямую, чтобы получить токен и user из ответа
        const response = await fetch(`${TELEGRAM_AUTH_URL}?action=callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (cancelled) return;

        const data = await response.json();

        if (response.ok && data.access_token && data.user) {
          console.log('[TelegramCallback] Успешная авторизация:', {
            token: data.access_token.substring(0, 20) + '...',
            user: data.user
          });

          // Сохраняем в cookies и localStorage для AuthContext
          Cookies.set('auth_token', data.access_token, { expires: 30, sameSite: 'lax' });
          Cookies.set('telegram_user', JSON.stringify(data.user), { expires: 30, sameSite: 'lax' });
          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('telegram_user', JSON.stringify(data.user));
          
          // Также сохраняем refresh_token для useTelegramAuth
          if (data.refresh_token) {
            localStorage.setItem('telegram_auth_refresh_token', data.refresh_token);
          }

          // Обновляем AuthContext
          await checkAuth();

          setStatus('success');
          setTimeout(() => navigate('/account'), 1500);
        } else {
          console.error('[TelegramCallback] Ошибка авторизации:', data);
          setStatus('error');
          setErrorMessage(data.error || 'Ошибка авторизации');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('[TelegramCallback] Исключение:', error);
        if (cancelled) return;
        setStatus('error');
        setErrorMessage('Произошла ошибка при авторизации');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    authenticate();
    
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Icon name="Loader2" className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Icon name="Check" className="h-8 w-8 text-white" />
              </div>
            )}
            {status === 'error' && (
              <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Icon name="X" className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Авторизация...'}
            {status === 'success' && 'Успешно!'}
            {status === 'error' && 'Ошибка'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && 'Проверяем ваши данные...'}
            {status === 'success' && 'Перенаправляем в личный кабинет...'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {status === 'loading' && (
            <div className="space-y-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Это займет всего несколько секунд
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramCallbackPage;