import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';

interface Booking {
  id: number;
  event_id: number;
  name: string;
  phone: string;
  telegram?: string;
  status: string;
  created_at: string;
  event_title?: string;
  user_email?: string;
  user_name?: string;
}

const AdminBookingsPage = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await adminApi.bookings.getAll();
      setBookings(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить бронирования',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminApi.bookings.update(id, { status });
      toast({
        title: 'Статус обновлен',
        description: `Бронирование переведено в статус: ${getStatusLabel(status)}`,
      });
      loadBookings();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это бронирование?')) return;
    
    try {
      await adminApi.bookings.delete(id);
      toast({
        title: 'Бронирование удалено',
        description: 'Запись успешно удалена',
      });
      loadBookings();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить бронирование',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено',
      completed: 'Завершено',
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Ожидает', variant: 'secondary' },
      confirmed: { label: 'Подтверждено', variant: 'default' },
      cancelled: { label: 'Отменено', variant: 'destructive' },
      completed: { label: 'Завершено', variant: 'outline' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.event_title && booking.event_title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление бронированиями</h2>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Поиск по имени или событию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">Ожидают</SelectItem>
            <SelectItem value="confirmed">Подтверждены</SelectItem>
            <SelectItem value="completed">Завершены</SelectItem>
            <SelectItem value="cancelled">Отменены</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-orange-900">
                      {booking.event_title || 'Событие не указано'}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="User" className="h-4 w-4" />
                        <span className="font-medium">{booking.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" className="h-4 w-4" />
                        <span>{booking.phone}</span>
                      </div>
                      {booking.telegram && (
                        <div className="flex items-center gap-2">
                          <Icon name="MessageCircle" className="h-4 w-4" />
                          <span>{booking.telegram}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" className="h-4 w-4" />
                        <span>Создано: {new Date(booking.created_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Hash" className="h-4 w-4" />
                        <span>ID: {booking.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      >
                        <Icon name="CheckCircle" className="h-4 w-4 mr-1" />
                        Подтвердить
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      >
                        <Icon name="XCircle" className="h-4 w-4 mr-1" />
                        Отменить
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateStatus(booking.id, 'completed')}
                    >
                      <Icon name="Check" className="h-4 w-4 mr-1" />
                      Завершить
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(booking.id)}
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Бронирования не найдены
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
