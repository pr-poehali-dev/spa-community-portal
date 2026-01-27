import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

const EVENTS_API = 'https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8';

interface Event {
  id: number;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  price: number;
  available_spots: number;
  total_spots: number;
  image_url: string;
}

interface Registration {
  id: number;
  event_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  status: string;
  registered_at: string;
}

interface Stats {
  total_events: number;
  upcoming_events: number;
  total_registrations: number;
  total_revenue: number;
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Получаем события организатора
      const eventsRes = await fetch(`${EVENTS_API}/?organizer=me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventsData = await eventsRes.json();
      setEvents(eventsData.events || []);

      // Получаем регистрации на события
      const regsRes = await fetch(`${EVENTS_API}/?action=registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const regsData = await regsRes.json();
      setRegistrations(regsData.registrations || []);

      // Рассчитываем статистику
      const upcoming = eventsData.events?.filter((e: Event) => new Date(e.date) > new Date()).length || 0;
      const totalRegs = regsData.registrations?.length || 0;
      const revenue = regsData.registrations?.reduce((sum: number, r: Registration) => {
        const event = eventsData.events?.find((e: Event) => e.id === r.event_id);
        return sum + (event?.price || 0);
      }, 0) || 0;

      setStats({
        total_events: eventsData.events?.length || 0,
        upcoming_events: upcoming,
        total_registrations: totalRegs,
        total_revenue: revenue
      });

      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего событий</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.total_events || 0}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="Calendar" className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Предстоящих</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.upcoming_events || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="Clock" className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Регистраций</p>
                <p className="text-2xl font-bold text-green-900">{stats?.total_registrations || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="Users" className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Доход</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.total_revenue.toLocaleString()} ₽</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="DollarSign" className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Мои события</TabsTrigger>
          <TabsTrigger value="registrations">Регистрации</TabsTrigger>
        </TabsList>

        {/* Вкладка "Мои события" */}
        <TabsContent value="events" className="space-y-4">
          <Card className="border-orange-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Calendar" className="h-5 w-5" />
                    Мои события
                  </CardTitle>
                  <CardDescription>
                    Управляйте своими мероприятиями
                  </CardDescription>
                </div>
                <Button>
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Создать событие
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="CalendarX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">У вас пока нет созданных событий</p>
                  <Button>
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Создать первое событие
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => {
                    const isUpcoming = new Date(event.date) > new Date();
                    const occupancy = ((event.total_spots - event.available_spots) / event.total_spots * 100).toFixed(0);

                    return (
                      <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex gap-4">
                          {event.image_url && (
                            <img 
                              src={event.image_url} 
                              alt={event.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-orange-900 mb-1">{event.title}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                                    {isUpcoming ? 'Предстоит' : 'Прошедшее'}
                                  </Badge>
                                  <Badge variant="outline">
                                    {event.type === 'men' && '👨 Мужское'}
                                    {event.type === 'women' && '👩 Женское'}
                                    {event.type === 'mixed' && '👥 Смешанное'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600">{event.price} ₽</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <p className="flex items-center gap-2">
                                <Icon name="Calendar" className="h-4 w-4" />
                                {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}
                              </p>
                              <p className="flex items-center gap-2">
                                <Icon name="MapPin" className="h-4 w-4" />
                                {event.location}
                              </p>
                              <p className="flex items-center gap-2">
                                <Icon name="Users" className="h-4 w-4" />
                                {event.total_spots - event.available_spots} / {event.total_spots} участников
                              </p>
                              <p className="flex items-center gap-2">
                                <Icon name="TrendingUp" className="h-4 w-4" />
                                Заполненность: {occupancy}%
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link to={`/events/${event.slug}`}>
                                <Button size="sm" variant="outline">
                                  <Icon name="Eye" className="h-4 w-4 mr-1" />
                                  Посмотреть
                                </Button>
                              </Link>
                              <Button size="sm" variant="outline">
                                <Icon name="Edit" className="h-4 w-4 mr-1" />
                                Редактировать
                              </Button>
                              <Button size="sm" variant="outline">
                                <Icon name="Users" className="h-4 w-4 mr-1" />
                                Участники
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка "Регистрации" */}
        <TabsContent value="registrations" className="space-y-4">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" className="h-5 w-5" />
                Регистрации участников
              </CardTitle>
              <CardDescription>
                Все регистрации на ваши события
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="UserX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Пока нет регистраций</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg) => {
                    const event = events.find(e => e.id === reg.event_id);
                    return (
                      <div key={reg.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-orange-900">{reg.user_name}</h4>
                              <Badge variant={
                                reg.status === 'confirmed' ? 'default' :
                                reg.status === 'pending' ? 'secondary' :
                                'outline'
                              }>
                                {reg.status === 'confirmed' && 'Подтверждено'}
                                {reg.status === 'pending' && 'Ожидает'}
                                {reg.status === 'canceled' && 'Отменено'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <Icon name="Mail" className="h-4 w-4" />
                                {reg.user_email}
                              </p>
                              <p className="flex items-center gap-2">
                                <Icon name="Calendar" className="h-4 w-4" />
                                Событие: {event?.title}
                              </p>
                              <p className="flex items-center gap-2">
                                <Icon name="Clock" className="h-4 w-4" />
                                Зарегистрирован: {new Date(reg.registered_at).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          {reg.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Icon name="Check" className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Icon name="X" className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
