import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminUsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Дмитрий Смирнов',
      email: 'dmitry@example.com',
      phone: '+7 (999) 111-22-33',
      role: 'user',
      status: 'active',
      registeredAt: '2025-12-15',
      bookings: 12,
      totalSpent: 15600,
    },
    {
      id: 2,
      name: 'Елена Волкова',
      email: 'elena@example.com',
      phone: '+7 (999) 222-33-44',
      role: 'user',
      status: 'active',
      registeredAt: '2026-01-03',
      bookings: 3,
      totalSpent: 4500,
    },
    {
      id: 3,
      name: 'Спам Бот',
      email: 'spam@example.com',
      phone: '+7 (999) 999-99-99',
      role: 'user',
      status: 'blocked',
      registeredAt: '2026-01-10',
      bookings: 0,
      totalSpent: 0,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const handleBlock = (id: number) => {
    toast({
      title: 'Пользователь заблокирован',
      description: 'Доступ к платформе ограничен',
      variant: 'destructive',
    });
  };

  const handleUnblock = (id: number) => {
    toast({
      title: 'Пользователь разблокирован',
      description: 'Доступ восстановлен',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активен', variant: 'default' as const },
      blocked: { label: 'Заблокирован', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление пользователями</h2>
      </div>

      <Input
        placeholder="Поиск по имени или email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-orange-900">{user.name}</h3>
                    {getStatusBadge(user.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Mail" className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" className="h-4 w-4" />
                        <span>Регистрация: {new Date(user.registeredAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="ClipboardList" className="h-4 w-4" />
                        <span>Бронирований: {user.bookings}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="DollarSign" className="h-4 w-4" />
                        <span>Потрачено: ₽{user.totalSpent.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {user.status === 'active' ? (
                    <Button
                      variant="outline"
                      onClick={() => handleBlock(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="Ban" className="h-4 w-4 mr-2" />
                      Заблокировать
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUnblock(user.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                      Разблокировать
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Icon name="Eye" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsersPage;
