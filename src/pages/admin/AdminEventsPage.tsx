import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminEventsPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Фестиваль банной культуры',
      date: '2026-02-15',
      location: 'Москва, Банная ул., 1',
      status: 'published',
      participants: 45,
      maxParticipants: 100,
    },
    {
      id: 2,
      title: 'Мастер-класс "Искусство парения"',
      date: '2026-02-20',
      location: 'Санкт-Петербург',
      status: 'draft',
      participants: 12,
      maxParticipants: 30,
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxParticipants: '',
    price: '',
  });

  const handleCreateEvent = () => {
    toast({
      title: 'Событие создано',
      description: 'Новое событие успешно добавлено',
    });
    setIsCreateDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      maxParticipants: '',
      price: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Опубликовано', variant: 'default' as const },
      draft: { label: 'Черновик', variant: 'secondary' as const },
      cancelled: { label: 'Отменено', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление событиями</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Создать событие
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новое событие</DialogTitle>
              <DialogDescription>
                Заполните информацию о событии
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Название события</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Фестиваль банной культуры"
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Подробное описание события..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Дата и время</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Локация</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Москва, Банная ул."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxParticipants">Макс. участников</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Цена, ₽</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1500"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  className="bg-gradient-to-r from-orange-500 to-amber-600"
                >
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-orange-900">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Users" className="h-4 w-4" />
                      <span>
                        {event.participants} / {event.maxParticipants} участников
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Icon name="Edit" className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Icon name="Eye" className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                    <Icon name="Trash2" className="h-4 w-4" />
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

export default AdminEventsPage;
