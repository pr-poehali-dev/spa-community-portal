import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminBookingsPage = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([
    {
      id: 'BK-001',
      user: 'Дмитрий Смирнов',
      sauna: 'Русская баня на дровах',
      date: '2026-01-15',
      time: '18:00',
      duration: 2,
      status: 'confirmed',
      amount: 2500,
      guests: 4,
    },
    {
      id: 'BK-002',
      user: 'Елена Волкова',
      sauna: 'Финская сауна Premium',
      date: '2026-01-16',
      time: '14:00',
      duration: 3,
      status: 'pending',
      amount: 3200,
      guests: 2,
    },
    {
      id: 'BK-003',
      user: 'Андрей Козлов',
      sauna: 'Турецкий хаммам',
      date: '2026-01-14',
      time: '20:00',
      duration: 2,
      status: 'completed',
      amount: 1800,
      guests: 3,
    },
    {
      id: 'BK-004',
      user: 'Мария Новикова',
      sauna: 'Русская баня на дровах',
      date: '2026-01-13',
      time: '16:00',
      duration: 2,
      status: 'cancelled',
      amount: 2500,
      guests: 5,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Подтверждено', variant: 'default' as const },
      pending: { label: 'Ожидает', variant: 'secondary' as const },
      completed: { label: 'Завершено', variant: 'outline' as const },
      cancelled: { label: 'Отменено', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCancel = (id: string) => {
    toast({
      title: 'Бронирование отменено',
      description: 'Пользователь получит уведомление',
      variant: 'destructive',
    });
  };

  const handleConfirm = (id: string) => {
    toast({
      title: 'Бронирование подтверждено',
      description: 'Пользователь получит уведомление',
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.sauna.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление бронированиями</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600">
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Создать запись
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ручное бронирование</DialogTitle>
              <DialogDescription>
                Создайте запись для пользователя
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Баня</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите баню" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Русская баня на дровах</SelectItem>
                    <SelectItem value="2">Финская сауна Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Дата</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Время</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Длительность (часов)</Label>
                  <Input type="number" placeholder="2" />
                </div>
                <div>
                  <Label>Гостей</Label>
                  <Input type="number" placeholder="4" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-600">
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Поиск по ID, пользователю или бане..."
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
            <SelectItem value="confirmed">Подтверждено</SelectItem>
            <SelectItem value="pending">Ожидает</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
            <SelectItem value="cancelled">Отменено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">{booking.id}</span>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon name="User" className="h-4 w-4" />
                      <span>{booking.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Home" className="h-4 w-4" />
                      <span>{booking.sauna}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="h-4 w-4" />
                      <span>{new Date(booking.date).toLocaleDateString('ru-RU')} в {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" className="h-4 w-4" />
                      <span>{booking.duration} часа, {booking.guests} гостей</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      ₽{booking.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(booking.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Icon name="CheckCircle" className="h-4 w-4 mr-1" />
                          Подтвердить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(booking.id)}
                          className="text-red-600"
                        >
                          <Icon name="XCircle" className="h-4 w-4 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600"
                      >
                        <Icon name="XCircle" className="h-4 w-4 mr-1" />
                        Отменить
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Icon name="Eye" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
