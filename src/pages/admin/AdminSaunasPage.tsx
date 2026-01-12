import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminSaunasPage = () => {
  const { toast } = useToast();
  const [saunas, setSaunas] = useState([
    {
      id: 1,
      name: 'Русская баня на дровах',
      partner: 'ООО "Банный комплекс"',
      location: 'Москва, ул. Банная, 5',
      status: 'active',
      rating: 4.8,
      bookings: 145,
    },
    {
      id: 2,
      name: 'Финская сауна Premium',
      partner: 'ИП Иванов А.В.',
      location: 'Санкт-Петербург',
      status: 'pending',
      rating: 0,
      bookings: 0,
    },
    {
      id: 3,
      name: 'Турецкий хаммам',
      partner: 'ООО "Восток"',
      location: 'Казань',
      status: 'suspended',
      rating: 4.2,
      bookings: 78,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleApprove = (id: number) => {
    toast({
      title: 'Баня одобрена',
      description: 'Заведение теперь видно пользователям',
    });
  };

  const handleReject = (id: number) => {
    toast({
      title: 'Заявка отклонена',
      description: 'Партнёр получит уведомление',
      variant: 'destructive',
    });
  };

  const handleSuspend = (id: number) => {
    toast({
      title: 'Баня заблокирована',
      description: 'Заведение скрыто из поиска',
      variant: 'destructive',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активна', variant: 'default' as const },
      pending: { label: 'На модерации', variant: 'secondary' as const },
      suspended: { label: 'Заблокирована', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredSaunas = saunas.filter((sauna) => {
    const matchesStatus = filterStatus === 'all' || sauna.status === filterStatus;
    const matchesSearch =
      sauna.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sauna.partner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление банями</h2>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Поиск по названию или партнеру..."
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
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="pending">На модерации</SelectItem>
            <SelectItem value="suspended">Заблокированные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSaunas.map((sauna) => (
          <Card key={sauna.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-orange-900">{sauna.name}</h3>
                    {getStatusBadge(sauna.status)}
                  </div>

                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon name="Building" className="h-4 w-4" />
                      <span>{sauna.partner}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" className="h-4 w-4" />
                      <span>{sauna.location}</span>
                    </div>
                    {sauna.status === 'active' && (
                      <>
                        <div className="flex items-center gap-2">
                          <Icon name="Star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{sauna.rating} рейтинг</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" className="h-4 w-4" />
                          <span>{sauna.bookings} бронирований</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {sauna.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(sauna.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                        Одобрить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(sauna.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Icon name="XCircle" className="h-4 w-4 mr-2" />
                        Отклонить
                      </Button>
                    </>
                  )}
                  {sauna.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={() => handleSuspend(sauna.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="Ban" className="h-4 w-4 mr-2" />
                      Заблокировать
                    </Button>
                  )}
                  {sauna.status === 'suspended' && (
                    <Button
                      onClick={() => handleApprove(sauna.id)}
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

export default AdminSaunasPage;
