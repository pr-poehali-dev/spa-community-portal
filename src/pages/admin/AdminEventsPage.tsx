import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';
import EventFormDialog from '@/components/admin/EventFormDialog';
import EventCard from '@/components/admin/EventCard';

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
  bathhouse_id?: number | null;
  master_id?: number | null;
}

interface Bath {
  id: number;
  name: string;
}

interface Master {
  id: number;
  name: string;
}

const AdminEventsPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [baths, setBaths] = useState<Bath[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
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
    bathhouse_id: null as number | null,
    master_id: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, bathsData, mastersData] = await Promise.all([
        adminApi.events.getAll(),
        adminApi.saunas.getAll(),
        adminApi.masters.getAll()
      ]);
      setEvents(eventsData);
      setBaths(bathsData);
      setMasters(mastersData);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const resetFormData = () => {
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
      bathhouse_id: null,
      master_id: null,
    });
  };

  const handleCreateEvent = async () => {
    try {
      await adminApi.events.create(formData);
      toast({
        title: 'Событие создано',
        description: 'Новое событие успешно добавлено',
      });
      setIsCreateDialogOpen(false);
      resetFormData();
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
      bathhouse_id: event.bathhouse_id || null,
      master_id: event.master_id || null,
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
      resetFormData();
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление событиями</h2>
        <Button 
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Icon name="Plus" className="h-4 w-4 mr-2" />
          Создать событие
        </Button>
      </div>

      <EventFormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateEvent}
      />

      <EventFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleUpdateEvent}
      />

      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => {
          const bathName = event.bathhouse_id ? baths.find(b => b.id === event.bathhouse_id)?.name : undefined;
          const masterName = event.master_id ? masters.find(m => m.id === event.master_id)?.name : undefined;
          
          return (
            <EventCard
              key={event.id}
              event={event}
              bathName={bathName}
              masterName={masterName}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdminEventsPage;