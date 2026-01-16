import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

const BOOKINGS_API = 'https://functions.poehali.dev/73cedafb-fa7b-4b1d-a5f1-f9be53f7767f';
const REVIEWS_API = 'https://functions.poehali.dev/6d9be798-b393-4f38-941a-9a2025d8ca11';
const CATALOG_API = 'https://functions.poehali.dev/7e573a30-cdfd-4b7f-9205-0cfc86ca8954';

interface MasterProfile {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews_count: number;
  services: any[];
}

interface Booking {
  id: number;
  client_name: string;
  service_type: string;
  booking_date: string;
  start_time: string;
  status: string;
  total_price: number;
}

interface Stats {
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  total_revenue: number;
  avg_rating: number;
}

export default function MasterDashboard() {
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Получаем профиль мастера
      const profileRes = await fetch(`${CATALOG_API}/?resource=masters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.items && profileData.items.length > 0) {
        setProfile(profileData.items[0]);
      }

      // Получаем бронирования
      const bookingsRes = await fetch(`${BOOKINGS_API}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings || []);

      // Рассчитываем статистику
      const completed = bookingsData.bookings?.filter((b: Booking) => b.status === 'completed').length || 0;
      const pending = bookingsData.bookings?.filter((b: Booking) => b.status === 'pending').length || 0;
      const revenue = bookingsData.bookings?.reduce((sum: number, b: Booking) => 
        b.status === 'completed' ? sum + b.total_price : sum, 0) || 0;

      setStats({
        total_bookings: bookingsData.bookings?.length || 0,
        completed_bookings: completed,
        pending_bookings: pending,
        total_revenue: revenue,
        avg_rating: profileData.items?.[0]?.rating || 0
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
                <p className="text-sm text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.total_bookings || 0}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="Calendar" className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выполнено</p>
                <p className="text-2xl font-bold text-green-900">{stats?.completed_bookings || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В ожидании</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.pending_bookings || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="Clock" className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Рейтинг</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.avg_rating.toFixed(1) || '0.0'}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="Star" className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Записи</TabsTrigger>
          <TabsTrigger value="profile">Мой профиль</TabsTrigger>
          <TabsTrigger value="services">Услуги</TabsTrigger>
        </TabsList>

        {/* Вкладка "Записи" */}
        <TabsContent value="bookings" className="space-y-4">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" className="h-5 w-5" />
                Предстоящие записи
              </CardTitle>
              <CardDescription>
                Управляйте записями клиентов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="CalendarX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Пока нет записей</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-orange-900">{booking.client_name}</h4>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'completed' ? 'secondary' :
                              booking.status === 'canceled' ? 'destructive' : 'outline'
                            }>
                              {booking.status === 'pending' && 'Ожидает'}
                              {booking.status === 'confirmed' && 'Подтверждено'}
                              {booking.status === 'completed' && 'Завершено'}
                              {booking.status === 'canceled' && 'Отменено'}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <Icon name="Calendar" className="h-4 w-4" />
                              {new Date(booking.booking_date).toLocaleDateString('ru-RU')} в {booking.start_time}
                            </p>
                            <p className="flex items-center gap-2">
                              <Icon name="Sparkles" className="h-4 w-4" />
                              {booking.service_type}
                            </p>
                            <p className="flex items-center gap-2">
                              <Icon name="Coins" className="h-4 w-4" />
                              {booking.total_price} ₽
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                <Icon name="Check" className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Icon name="X" className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка "Мой профиль" */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" className="h-5 w-5" />
                Информация о мастере
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Имя</label>
                      <p className="font-semibold text-orange-900">{profile.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Специализация</label>
                      <p className="font-semibold text-orange-900">{profile.specialization}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Опыт работы</label>
                      <p className="font-semibold text-orange-900">{profile.experience} лет</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Рейтинг</label>
                      <p className="font-semibold text-orange-900 flex items-center gap-1">
                        <Icon name="Star" className="h-4 w-4 text-amber-500" />
                        {profile.rating.toFixed(1)} ({profile.reviews_count} отзывов)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <Icon name="Edit" className="h-4 w-4 mr-2" />
                      Редактировать профиль
                    </Button>
                    <Link to={`/masters/${profile.id}`}>
                      <Button variant="outline">
                        <Icon name="Eye" className="h-4 w-4 mr-2" />
                        Посмотреть как видят клиенты
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Профиль мастера не найден</p>
                  <Button className="mt-4">
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Создать профиль мастера
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка "Услуги" */}
        <TabsContent value="services" className="space-y-4">
          <Card className="border-orange-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Sparkles" className="h-5 w-5" />
                    Мои услуги
                  </CardTitle>
                  <CardDescription>Управляйте своими услугами и ценами</CardDescription>
                </div>
                <Button>
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Добавить услугу
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile?.services && profile.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.services.map((service: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-orange-900">{service.name}</h4>
                        <Badge variant="secondary">{service.price} ₽</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Icon name="Clock" className="h-3 w-3" />
                        {service.duration} мин
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="Package" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">У вас пока нет добавленных услуг</p>
                  <Button>
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Добавить первую услугу
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
