import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

const BOOKINGS_API = 'https://functions.poehali.dev/73cedafb-fa7b-4b1d-a5f1-f9be53f7767f';
const EVENTS_API = 'https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8';
const REVIEWS_API = 'https://functions.poehali.dev/6d9be798-b393-4f38-941a-9a2025d8ca11';
const BLOG_API = 'https://functions.poehali.dev/756eea00-7132-49ee-a076-e43afac6d5a6';

interface Booking {
  id: number;
  item_name: string;
  item_type: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  status: string;
  total_price: number;
}

interface EventRegistration {
  id: number;
  event_title: string;
  event_date: string;
  event_time: string;
  event_location: string;
  status: string;
}

interface Review {
  id: number;
  item_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  status: string;
  views_count: number;
  created_at: string;
}

export default function ParticipantDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<EventRegistration[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Получаем бронирования
      const bookingsRes = await fetch(`${BOOKINGS_API}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings || []);

      // Получаем регистрации на события
      const eventsRes = await fetch(`${EVENTS_API}/?action=my_registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventsData = await eventsRes.json();
      setEvents(eventsData.registrations || []);

      // Получаем отзывы
      const reviewsRes = await fetch(`${REVIEWS_API}/?my_reviews=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData.reviews || []);

      // Получаем посты блога
      const blogRes = await fetch(`${BLOG_API}/?author=me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blogData = await blogRes.json();
      setBlogPosts(blogData.posts || []);

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
                <p className="text-sm text-gray-600">Бронирований</p>
                <p className="text-2xl font-bold text-orange-900">{bookings.length}</p>
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
                <p className="text-sm text-gray-600">Событий</p>
                <p className="text-2xl font-bold text-blue-900">{events.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="CalendarDays" className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Отзывов</p>
                <p className="text-2xl font-bold text-green-900">{reviews.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="Star" className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Постов в блоге</p>
                <p className="text-2xl font-bold text-purple-900">{blogPosts.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="FileText" className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings">Бронирования</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="blog">Мой блог</TabsTrigger>
        </TabsList>

        {/* Вкладка "Бронирования" */}
        <TabsContent value="bookings" className="space-y-4">
          <Card className="border-orange-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Calendar" className="h-5 w-5" />
                    Мои бронирования
                  </CardTitle>
                  <CardDescription>
                    Все ваши записи на бани и к мастерам
                  </CardDescription>
                </div>
                <Link to="/baths">
                  <Button>
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Забронировать
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="CalendarX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">У вас пока нет бронирований</p>
                  <Link to="/baths">
                    <Button>
                      <Icon name="Plus" className="h-4 w-4 mr-2" />
                      Забронировать баню
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-1">{booking.item_name}</h4>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'completed' ? 'secondary' :
                            booking.status === 'canceled' ? 'destructive' : 'outline'
                          }>
                            {booking.status === 'pending' && 'Ожидает подтверждения'}
                            {booking.status === 'confirmed' && 'Подтверждено'}
                            {booking.status === 'completed' && 'Завершено'}
                            {booking.status === 'canceled' && 'Отменено'}
                          </Badge>
                        </div>
                        <p className="font-bold text-orange-600">{booking.total_price} ₽</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <p className="flex items-center gap-2">
                          <Icon name="Calendar" className="h-4 w-4" />
                          {new Date(booking.booking_date).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="flex items-center gap-2">
                          <Icon name="Clock" className="h-4 w-4" />
                          {booking.start_time} ({booking.duration_hours}ч)
                        </p>
                        <p className="flex items-center gap-2">
                          <Icon name="Tag" className="h-4 w-4" />
                          {booking.item_type === 'bath' ? 'Баня' : 'Мастер'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && (
                          <Button size="sm" variant="outline">
                            <Icon name="X" className="h-4 w-4 mr-1" />
                            Отменить
                          </Button>
                        )}
                        {booking.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <Icon name="Star" className="h-4 w-4 mr-1" />
                            Оставить отзыв
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка "События" */}
        <TabsContent value="events" className="space-y-4">
          <Card className="border-blue-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CalendarDays" className="h-5 w-5" />
                    Мои события
                  </CardTitle>
                  <CardDescription>
                    События, на которые вы зарегистрированы
                  </CardDescription>
                </div>
                <Link to="/events">
                  <Button>
                    <Icon name="Search" className="h-4 w-4 mr-2" />
                    Найти событие
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="CalendarX" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Вы пока не зарегистрированы ни на одно событие</p>
                  <Link to="/events">
                    <Button>
                      <Icon name="Search" className="h-4 w-4 mr-2" />
                      Найти событие
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1">{event.event_title}</h4>
                          <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                            {event.status === 'confirmed' ? 'Подтверждено' : 'Ожидает подтверждения'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Icon name="Calendar" className="h-4 w-4" />
                          {new Date(event.event_date).toLocaleDateString('ru-RU')} в {event.event_time}
                        </p>
                        <p className="flex items-center gap-2">
                          <Icon name="MapPin" className="h-4 w-4" />
                          {event.event_location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка "Отзывы" */}
        <TabsContent value="reviews" className="space-y-4">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Star" className="h-5 w-5" />
                Мои отзывы
              </CardTitle>
              <CardDescription>
                Отзывы, которые вы оставили
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="MessageSquare" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Вы пока не оставляли отзывов</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-green-900">{review.item_name}</h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              name="Star"
                              className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка "Мой блог" */}
        <TabsContent value="blog" className="space-y-4">
          <Card className="border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileText" className="h-5 w-5" />
                    Мои посты
                  </CardTitle>
                  <CardDescription>
                    Ваши публикации в блоге СПАРКОМ
                  </CardDescription>
                </div>
                <Button>
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Написать пост
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {blogPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="FileText" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">У вас пока нет публикаций</p>
                  <Button>
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Написать первый пост
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Link to={`/blog/post/${post.slug}`}>
                            <h4 className="font-semibold text-purple-900 hover:text-purple-700 mb-1">
                              {post.title}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              post.status === 'published' ? 'default' :
                              post.status === 'draft' ? 'secondary' :
                              post.status === 'blocked' ? 'destructive' : 'outline'
                            }>
                              {post.status === 'draft' && 'Черновик'}
                              {post.status === 'published' && 'Опубликовано'}
                              {post.status === 'hidden' && 'Скрыто'}
                              {post.status === 'blocked' && 'Заблокировано'}
                            </Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Icon name="Eye" className="h-4 w-4" />
                              {post.views_count} просмотров
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
