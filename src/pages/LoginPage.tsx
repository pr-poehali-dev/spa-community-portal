import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { TelegramLoginButton } from '@/components/extensions/telegram-bot/TelegramLoginButton';
import { useTelegramAuth } from '@/components/extensions/telegram-bot/useTelegramAuth';

const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { num1, num2, answer: num1 + num2 };
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const telegramAuth = useTelegramAuth();

  const [loginData, setLoginData] = useState({ email: '', password: '', captcha: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    telegram: '',
    captcha: ''
  });
  const [loading, setLoading] = useState(false);
  const [loginCaptcha, setLoginCaptcha] = useState(generateCaptcha());
  const [registerCaptcha, setRegisterCaptcha] = useState(generateCaptcha());

  useEffect(() => {
    setLoginCaptcha(generateCaptcha());
    setRegisterCaptcha(generateCaptcha());
  }, []);

  const from = (location.state as any)?.from?.pathname || '/account/dashboard';

  const handleTelegramLogin = () => {
    telegramAuth.login();
    toast({
      title: 'Переход в Telegram',
      description: 'Откройте бота в Telegram для авторизации'
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(loginData.captcha) !== loginCaptcha.answer) {
      toast({
        title: 'Ошибка',
        description: 'Неверный ответ на вопрос. Попробуйте ещё раз.',
        variant: 'destructive'
      });
      setLoginCaptcha(generateCaptcha());
      setLoginData({ ...loginData, captcha: '' });
      return;
    }

    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать!'
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Ошибка входа',
        description: error.message || 'Проверьте email и пароль',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(registerData.captcha) !== registerCaptcha.answer) {
      toast({
        title: 'Ошибка',
        description: 'Неверный ответ на вопрос. Попробуйте ещё раз.',
        variant: 'destructive'
      });
      setRegisterCaptcha(generateCaptcha());
      setRegisterData({ ...registerData, captcha: '' });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive'
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      await register(
        registerData.email,
        registerData.password,
        registerData.name,
        registerData.phone,
        registerData.telegram
      );
      toast({
        title: 'Регистрация успешна',
        description: 'Добро пожаловать в сообщество!'
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message || 'Попробуйте другой email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <Icon name="Flame" className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Банное сообщество</CardTitle>
          <CardDescription>Войдите или создайте аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ivan@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-captcha" className="flex items-center gap-2">
                    <Icon name="Shield" className="h-4 w-4 text-orange-600" />
                    Защита от роботов
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-center font-mono text-lg font-semibold text-orange-800">
                      {loginCaptcha.num1} + {loginCaptcha.num2} = ?
                    </div>
                    <Input
                      id="login-captcha"
                      type="number"
                      placeholder="?"
                      className="w-20 text-center text-lg font-semibold"
                      value={loginData.captcha}
                      onChange={(e) => setLoginData({ ...loginData, captcha: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Решите пример для продолжения</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Или</span>
                  </div>
                </div>

                <TelegramLoginButton 
                  onClick={handleTelegramLogin}
                  isLoading={telegramAuth.isLoading}
                  className="w-full"
                />

                <div className="text-center">
                  <a href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 hover:underline">
                    Забыли пароль?
                  </a>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Имя</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Иван Иванов"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ivan@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Телефон (необязательно)</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+7 999 123-45-67"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-telegram">Telegram (необязательно)</Label>
                  <Input
                    id="register-telegram"
                    type="text"
                    placeholder="@ivan"
                    value={registerData.telegram}
                    onChange={(e) => setRegisterData({ ...registerData, telegram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Подтвердите пароль</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-captcha" className="flex items-center gap-2">
                    <Icon name="Shield" className="h-4 w-4 text-orange-600" />
                    Защита от роботов
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-center font-mono text-lg font-semibold text-orange-800">
                      {registerCaptcha.num1} + {registerCaptcha.num2} = ?
                    </div>
                    <Input
                      id="register-captcha"
                      type="number"
                      placeholder="?"
                      className="w-20 text-center text-lg font-semibold"
                      value={registerData.captcha}
                      onChange={(e) => setRegisterData({ ...registerData, captcha: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Решите пример для продолжения</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Создать аккаунт'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;