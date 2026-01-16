import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  telegram?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  avatar_url?: string;
}

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.users.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await adminApi.users.update(id, { is_active: !currentStatus });
      toast({
        title: currentStatus ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
        description: currentStatus ? 'Доступ к платформе ограничен' : 'Доступ восстановлен',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
    try {
      await adminApi.users.delete(id);
      toast({
        title: 'Пользователь удален',
        description: 'Аккаунт успешно удален',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пользователя',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      participant: { label: 'Участник', variant: 'default' },
      master: { label: 'Мастер', variant: 'secondary' },
      partner: { label: 'Партнер', variant: 'outline' },
      organizer: { label: 'Организатор', variant: 'secondary' },
      editor: { label: 'Редактор', variant: 'secondary' },
      admin: { label: 'Админ', variant: 'destructive' },
    };
    const config = roleConfig[role] || { label: role, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление пользователями</h2>
        <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
          <Icon name="Plus" className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-700">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-orange-900">{user.name}</h3>
                    {getRoleBadge(user.role)}
                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                      {user.is_active ? 'Активен' : 'Заблокирован'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="Mail" className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.telegram && (
                      <div className="flex items-center gap-2">
                        <Icon name="MessageCircle" className="h-4 w-4" />
                        <span>{user.telegram}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="h-4 w-4" />
                      <span>Регистрация: {new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                  >
                    {user.is_active ? (
                      <>
                        <Icon name="Ban" className="h-4 w-4 mr-1" />
                        Заблокировать
                      </>
                    ) : (
                      <>
                        <Icon name="CheckCircle" className="h-4 w-4 mr-1" />
                        Разблокировать
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Пользователи не найдены
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;