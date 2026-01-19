import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { adminApi } from '@/lib/adminApi';

interface Event {
  id: number;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'men' | 'women' | 'mixed';
  price: number;
  available_spots: number;
  total_spots: number;
  image_url?: string;
}

const AdminEventsPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    date: '',
    time: '14:00',
    location: '',
    type: 'mixed',
    total_spots: 10,
    price: 1500,
    image_url: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await adminApi.events.getAll();
      setEvents(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить события',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await adminApi.events.create(formData);
      toast({
        title: 'Событие создано',
        description: 'Новое событие успешно добавлено',
      });
      setIsCreateDialogOpen(false);
      setFormData({
        slug: '',
        title: '',
        description: '',
        date: '',
        time: '14:00',
        location: '',
        type: 'mixed',
        total_spots: 10,
        price: 1500,
        image_url: '',
      });
      loadEvents();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать событие',
        variant: 'destructive',
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setFormData({
      slug: event.slug,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      total_spots: event.total_spots,
      price: event.price,
      image_url: event.image_url || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEventId) return;
    
    try {
      await adminApi.events.update(editingEventId, formData);
      toast({
        title: 'Событие обновлено',
        description: 'Изменения успешно сохранены',
      });
      setIsEditDialogOpen(false);
      setEditingEventId(null);
      setFormData({
        slug: '',
        title: '',
        description: '',
        date: '',
        time: '14:00',
        location: '',
        type: 'mixed',
        total_spots: 10,
        price: 1500,
        image_url: '',
      });
      loadEvents();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить событие',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) return;
    
    try {
      await adminApi.events.delete(id);
      toast({
        title: 'Событие удалено',
        description: 'Событие успешно удалено',
      });
      loadEvents();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить событие',
        variant: 'destructive',
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const config = {
      men: { label: 'Мужское', variant: 'default' as const },
      women: { label: 'Женское', variant: 'secondary' as const },
      mixed: { label: 'Смешанное', variant: 'outline' as const },
    };
    const typeConfig = config[type as keyof typeof config];
    return <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="festival-bannoy-kultury"
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
                  <Label htmlFor="date">Дата</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Время</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Локация</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Москва, Банная ул., 1"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Тип</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Мужское</SelectItem>
                      <SelectItem value="women">Женское</SelectItem>
                      <SelectItem value="mixed">Смешанное</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="total_spots">Макс. мест</Label>
                  <Input
                    id="total_spots"
                    type="number"
                    value={formData.total_spots}
                    onChange={(e) => setFormData({ ...formData, total_spots: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Цена, ₽</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image_url">URL изображения</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать событие</DialogTitle>
            <DialogDescription>
              Измените информацию о событии
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Название события</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Фестиваль банной культуры"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug (URL)</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="festival-bannoy-kultury"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Подробное описание события..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Дата</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Время</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Локация</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Москва, Банная ул., 1"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-type">Тип</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Мужское</SelectItem>
                    <SelectItem value="women">Женское</SelectItem>
                    <SelectItem value="mixed">Смешанное</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-total_spots">Макс. мест</Label>
                <Input
                  id="edit-total_spots"
                  type="number"
                  value={formData.total_spots}
                  onChange={(e) => setFormData({ ...formData, total_spots: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Цена, ₽</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-image_url">URL изображения</Label>
              <Input
                id="edit-image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button
                onClick={handleUpdateEvent}
                className="bg-gradient-to-r from-orange-500 to-amber-600"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <Card key={event.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-orange-900">{event.title}</h3>
                    {getTypeBadge(event.type)}
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Users" className="h-4 w-4" />
                      <span>
                        {event.total_spots - event.available_spots} / {event.total_spots} участников
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Coins" className="h-4 w-4" />
                      <span>{event.price} ₽</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                  >
                    <Icon name="Eye" className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Icon name="Pencil" className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
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