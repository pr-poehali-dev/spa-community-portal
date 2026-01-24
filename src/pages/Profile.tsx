import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Profile = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      'user': 'Участник',
      'participant': 'Участник',
      'master': 'Пармастер',
      'partner': 'Партнёр',
      'organizer': 'Организатор',
      'editor': 'Редактор'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'user': 'bg-gray-100 text-gray-800',
      'participant': 'bg-blue-100 text-blue-800',
      'master': 'bg-purple-100 text-purple-800',
      'partner': 'bg-green-100 text-green-800',
      'organizer': 'bg-amber-100 text-amber-800',
      'editor': 'bg-pink-100 text-pink-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-3xl font-serif mb-2">{user.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleName(user.role)}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Icon name="LogOut" size={20} className="mr-2" />
                Выйти
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Mail" size={20} className="text-amber-600" />
                  <span className="font-medium">Email</span>
                </div>
                <p className="text-lg pl-7">{user.email}</p>
              </div>

              {user.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Phone" size={20} className="text-amber-600" />
                    <span className="font-medium">Телефон</span>
                  </div>
                  <p className="text-lg pl-7">{user.phone}</p>
                </div>
              )}

              {user.telegram && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="MessageCircle" size={20} className="text-amber-600" />
                    <span className="font-medium">Telegram</span>
                  </div>
                  <p className="text-lg pl-7">{user.telegram}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/events')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Icon name="Calendar" size={32} className="text-amber-600" />
                <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">Мои бронирования</CardTitle>
              <CardDescription>Просмотр забронированных событий</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/bany')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Icon name="Home" size={32} className="text-amber-600" />
                <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">Избранные бани</CardTitle>
              <CardDescription>Ваши любимые заведения</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/masters')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Icon name="UserCheck" size={32} className="text-amber-600" />
                <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">Мои мастера</CardTitle>
              <CardDescription>Любимые пармастера</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
