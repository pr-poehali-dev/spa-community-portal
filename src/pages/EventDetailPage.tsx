import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { getEventBySlug, getEventSchedules, Event, ServiceSchedule } from '@/lib/api';

const getTypeLabel = (type: string) => {
  switch(type) {
    case 'male': return 'Мужской';
    case 'female': return 'Женский';
    case 'mixed': return 'Совместный';
    default: return '';
  }
};

const getTypeBadgeColor = (type: string) => {
  switch(type) {
    case 'male': return 'bg-blue-100 text-blue-800';
    case 'female': return 'bg-pink-100 text-pink-800';
    case 'mixed': return 'bg-purple-100 text-purple-800';
    default: return '';
  }
};

const EventDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadEventData = async (eventSlug: string) => {
      if (isMounted) setLoading(true);
      try {
        const eventData = await getEventBySlug(eventSlug);
        if (isMounted) setEvent(eventData);
        
        if (eventData && eventData.id && isMounted) {
          loadSchedules(eventData.id);
        }
      } catch (error) {
        if (isMounted) console.error('Failed to load event:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const loadSchedules = async (eventId: string) => {
      if (isMounted) setSchedulesLoading(true);
      try {
        const schedulesData = await getEventSchedules(eventId);
        if (isMounted) setSchedules(schedulesData.schedules || []);
      } catch (error) {
        if (isMounted) console.error('Failed to load schedules:', error);
      } finally {
        if (isMounted) setSchedulesLoading(false);
      }
    };

    if (slug) {
      loadEventData(slug);
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (event: Event) => {
    if (event.image_url) return event.image_url;
    if (event.images && event.images.length > 0) return event.images[0].url;
    return 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/placeholder.jpg';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="flex items-center gap-2">
          <Icon name="Loader2" className="h-5 w-5 animate-spin" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return <Navigate to="/404" replace />;
  }

  const imageUrl = getImageUrl(event);

  return (
    <div className="animate-fade-in">
      <div 
        className="relative h-[40vh] bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Link to="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к событиям</span>
            </Link>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-white/90 text-sm md:text-base">
              <Badge className={`${getTypeBadgeColor(event.gender_type)} text-sm`}>
                {getTypeLabel(event.gender_type)}
              </Badge>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={18} />
                <span>{event.duration_minutes} мин</span>
              </div>
              {event.bathhouse && (
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={18} />
                  <span>{event.bathhouse.name}</span>
                </div>
              )}
              {event.city && !event.bathhouse && (
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={18} />
                  <span>{event.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex items-center gap-2">
                  <Icon name="FileText" className="h-5 w-5 text-primary" />
                  Описание
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {event.program && Array.isArray(event.program) && event.program.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-serif flex items-center gap-2">
                    <Icon name="List" className="h-5 w-5 text-primary" />
                    Программа события
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {event.program.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-muted-foreground pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {event.rules && Array.isArray(event.rules) && event.rules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-serif flex items-center gap-2">
                    <Icon name="AlertCircle" className="h-5 w-5 text-primary" />
                    Правила посещения
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Icon name="Check" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-serif flex items-center gap-2">
                  <Icon name="Calendar" className="h-5 w-5 text-primary" />
                  Доступные даты и время
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <div className="text-center py-8">
                    <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Загрузка расписания...</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="CalendarOff" className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Расписание пока не опубликовано</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="text-center min-w-[80px]">
                              <div className="text-sm font-medium text-muted-foreground">
                                {formatDateShort(schedule.start_datetime)}
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {formatTime(schedule.start_datetime)}
                              </div>
                            </div>
                            <Separator orientation="vertical" className="h-10" />
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                              <span className={schedule.capacity_available > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                                {schedule.capacity_available > 0 
                                  ? `Осталось ${schedule.capacity_available} из ${schedule.capacity_total} мест`
                                  : 'Мест нет'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          disabled={schedule.capacity_available === 0 || schedule.status !== 'active'}
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          {schedule.capacity_available === 0 ? 'Нет мест' : 'Записаться'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Бронирование</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Стоимость</span>
                  <span className="text-3xl font-bold text-primary">{event.price} ₽</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Длительность</span>
                    <span className="font-medium">{event.duration_minutes} минут</span>
                  </div>

                  {schedules.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Свободных мест</span>
                        <span className="font-medium text-green-600">
                          до {Math.max(...schedules.map(s => s.capacity_available))} мест
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Доступных дат</span>
                        <span className="font-medium">{schedules.length}</span>
                      </div>
                    </>
                  )}
                </div>

                {event.bathhouse && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Home" className="h-4 w-4 text-primary" />
                      Баня
                    </p>
                    <Link 
                      to={`/baths/${event.bathhouse.slug}`}
                      className="block space-y-1 hover:bg-primary/5 p-2 rounded-lg transition-colors -m-2"
                    >
                      <p className="text-sm font-medium">{event.bathhouse.name}</p>
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <Icon name="MapPin" className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {event.bathhouse.address}
                      </p>
                      {event.bathhouse.rating && event.bathhouse.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Icon name="Star" className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{event.bathhouse.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({event.bathhouse.reviews_count} отзывов)</span>
                        </div>
                      )}
                    </Link>
                  </div>
                )}

                {event.master && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="User" className="h-4 w-4 text-primary" />
                      Мастер
                    </p>
                    <Link 
                      to={`/masters/${event.master.slug}`}
                      className="flex items-center gap-3 hover:bg-primary/5 p-2 rounded-lg transition-colors -m-2"
                    >
                      {event.master.avatar_url && (
                        <img 
                          src={event.master.avatar_url} 
                          alt={event.master.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.master.name}</p>
                        {event.master.specialization && (
                          <p className="text-xs text-muted-foreground">{event.master.specialization}</p>
                        )}
                        {event.master.rating && event.master.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs mt-1">
                            <Icon name="Star" className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{event.master.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                )}

                {event.organizer && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="UserCircle" className="h-4 w-4 text-primary" />
                      Организатор
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.organizer.name}</p>
                      {user ? (
                        <>
                          {event.organizer.phone && (
                            <a 
                              href={`tel:${event.organizer.phone}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Icon name="Phone" className="h-3 w-3" />
                              {event.organizer.phone}
                            </a>
                          )}
                          {event.organizer.telegram && (
                            <a 
                              href={`https://t.me/${event.organizer.telegram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Icon name="Send" className="h-3 w-3" />
                              @{event.organizer.telegram.replace('@', '')}
                            </a>
                          )}
                        </>
                      ) : (
                        <Link 
                          to="/login"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Icon name="Lock" className="h-3 w-3" />
                          Войдите, чтобы увидеть контакты
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-4" 
                  size="lg" 
                  disabled={schedules.length === 0 || schedules.every(s => s.capacity_available === 0)}
                >
                  {schedules.length > 0 && schedules.some(s => s.capacity_available > 0) 
                    ? 'Выбрать дату и записаться' 
                    : 'Мест нет'}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Выберите удобную дату в расписании выше
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;