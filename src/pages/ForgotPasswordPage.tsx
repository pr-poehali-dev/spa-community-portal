import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/dc13fdd2-eb59-4658-8080-4ab0c13a84af', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request-reset', email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки');
      }

      setSent(true);
      toast({
        title: 'Письмо отправлено',
        description: data.message
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
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
              <Icon name="KeyRound" className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Восстановление пароля</CardTitle>
          <CardDescription>
            {sent 
              ? 'Проверьте вашу почту' 
              : 'Введите email для получения ссылки'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <Icon name="MailCheck" className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-800">
                  Если аккаунт с таким email существует, мы отправили письмо с инструкцией для восстановления пароля.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Не получили письмо? Проверьте папку "Спам" или повторите попытку через несколько минут.
              </p>
              <Button 
                onClick={() => setSent(false)} 
                variant="outline" 
                className="w-full"
              >
                Отправить повторно
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                  Вернуться к входу
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email адрес</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Мы отправим ссылку для создания нового пароля
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить ссылку'}
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                  Вернуться к входу
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
