import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminMastersPage = () => {
  const { toast } = useToast();
  const [masters, setMasters] = useState([
    {
      id: 1,
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+7 (999) 123-45-67',
      status: 'verified',
      experience: 5,
      rating: 4.9,
      completedSessions: 234,
      commission: 15,
    },
    {
      id: 2,
      name: 'Мария Сидорова',
      email: 'maria@example.com',
      phone: '+7 (999) 234-56-78',
      status: 'pending',
      experience: 3,
      rating: 0,
      completedSessions: 0,
      commission: 15,
    },
    {
      id: 3,
      name: 'Алексей Иванов',
      email: 'alex@example.com',
      phone: '+7 (999) 345-67-89',
      status: 'suspended',
      experience: 7,
      rating: 4.2,
      completedSessions: 156,
      commission: 12,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleVerify = (id: number) => {
    toast({
      title: 'Мастер верифицирован',
      description: 'Профиль одобрен и доступен пользователям',
    });
  };

  const handleReject = (id: number) => {
    toast({
      title: 'Заявка отклонена',
      description: 'Мастер получит уведомление',
      variant: 'destructive',
    });
  };

  const handleSuspend = (id: number) => {
    toast({
      title: 'Мастер заблокирован',
      description: 'Профиль скрыт из поиска',
      variant: 'destructive',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { label: 'Верифицирован', variant: 'default' as const },
      pending: { label: 'На проверке', variant: 'secondary' as const },
      suspended: { label: 'Заблокирован', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredMasters = masters.filter((master) => {
    const matchesStatus = filterStatus === 'all' || master.status === filterStatus;
    const matchesSearch =
      master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      master.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление мастерами</h2>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Поиск по имени или email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="verified">Верифицированные</SelectItem>
            <SelectItem value="pending">На проверке</SelectItem>
            <SelectItem value="suspended">Заблокированные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMasters.map((master) => (
          <Card key={master.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${master.name}`} />
                  <AvatarFallback>{master.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-orange-900">{master.name}</h3>
                    {getStatusBadge(master.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Mail" className="h-4 w-4" />
                        <span>{master.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" className="h-4 w-4" />
                        <span>{master.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Award" className="h-4 w-4" />
                        <span>Опыт: {master.experience} лет</span>
                      </div>
                    </div>

                    {master.status === 'verified' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon name="Star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>Рейтинг: {master.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="CheckCircle" className="h-4 w-4" />
                          <span>Сеансов: {master.completedSessions}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Percent" className="h-4 w-4" />
                          <span>Комиссия: {master.commission}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {master.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleVerify(master.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                        Верифицировать
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(master.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Icon name="XCircle" className="h-4 w-4 mr-2" />
                        Отклонить
                      </Button>
                    </>
                  )}
                  {master.status === 'verified' && (
                    <Button
                      variant="outline"
                      onClick={() => handleSuspend(master.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="Ban" className="h-4 w-4 mr-2" />
                      Заблокировать
                    </Button>
                  )}
                  {master.status === 'suspended' && (
                    <Button
                      onClick={() => handleVerify(master.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                      Разблокировать
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Icon name="Edit" className="h-4 w-4" />
                  </Button>
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

export default AdminMastersPage;
