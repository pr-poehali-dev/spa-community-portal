import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [event, setEvent] = useState<Event | null>(null);
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      loadEventData(slug);
    }
  }, [slug]);

  const loadEventData = async (eventSlug: string) => {
    setLoading(true);
    try {
      const eventData = await getEventBySlug(eventSlug);
      setEvent(eventData);
      
      if (eventData && eventData.id) {
        loadSchedules(eventData.id);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async (eventId: string) => {
    setSchedulesLoading(true);
    try {
      const schedulesData = await getEventSchedules(eventId);
      setSchedules(schedulesData.schedules || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setSchedulesLoading(false);
    }
  };

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
        className="relative h-[50vh] bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Link to="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к событиям</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-white">
              <Badge className={`${getTypeBadgeColor(event.gender_type)} text-base`}>
                {getTypeLabel(event.gender_type)}
              </Badge>
              {event.nearest_datetime && (
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={20} />
                  <span>{formatDateTime(event.nearest_datetime)}</span>
                </div>
              )}
              {event.bathhouse && (
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={20} />
                  <span>{event.bathhouse.name}</span>
                </div>
              )}
              {event.city && !event.bathhouse && (
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={20} />
                  <span>{event.city}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={20} />
                <span>{event.duration_minutes} минут</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Описание</TabsTrigger>
                <TabsTrigger value="program">Программа</TabsTrigger>
                <TabsTrigger value="schedule">Расписание</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="program" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {event.program && Array.isArray(event.program) && event.program.length > 0 ? (
                      <ul className="space-y-3">
                        {event.program.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">{index + 1}</span>
                            </div>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-center py-6">Программа мероприятия уточняется</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="schedule" className="mt-6">
                {schedulesLoading ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Загрузка расписания...</p>
                    </CardContent>
                  </Card>
                ) : schedules.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <Icon name="CalendarOff" className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Расписание пока не опубликовано</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {schedules.map((schedule) => (
                      <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon name="Calendar" className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{formatDateTime(schedule.start_datetime)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon name="Users" className="h-4 w-4" />
                                <span>Свободно мест: {schedule.capacity_available} из {schedule.capacity_total}</span>
                              </div>
                              {schedule.price && (
                                <div className="flex items-center gap-2">
                                  <Icon name="Coins" className="h-4 w-4 text-primary" />
                                  <span className="text-xl font-bold text-primary">{schedule.price} ₽</span>
                                </div>
                              )}
                            </div>
                            <Button 
                              disabled={schedule.capacity_available === 0 || schedule.status !== 'active'}
                              className="whitespace-nowrap"
                            >
                              {schedule.capacity_available === 0 ? 'Мест нет' : 'Записаться'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {event.rules && Array.isArray(event.rules) && event.rules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl flex items-center gap-2">
                    <Icon name="AlertCircle" className="h-5 w-5" />
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
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Стоимость</span>
                  <span className="text-3xl font-bold text-primary">{event.price} ₽</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Длительность</span>
                  <span className="font-medium">{event.duration_minutes} минут</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Свободных мест</span>
                  <span className="font-medium">{event.available_spots}</span>
                </div>

                {event.schedules_count > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Доступных дат</span>
                    <span className="font-medium">{event.schedules_count}</span>
                  </div>
                )}

                {event.bathhouse && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-semibold">Место проведения:</p>
                    <div className="space-y-1">
                      <p className="text-sm">{event.bathhouse.name}</p>
                      <p className="text-xs text-muted-foreground">{event.bathhouse.address}</p>
                    </div>
                  </div>
                )}

                {event.master && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-semibold">Мастер:</p>
                    <div className="flex items-center gap-3">
                      {event.master.avatar_url && (
                        <img 
                          src={event.master.avatar_url} 
                          alt={event.master.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <p className="text-sm">{event.master.name}</p>
                    </div>
                  </div>
                )}

                <Button className="w-full mt-4" size="lg" disabled={event.available_spots === 0}>
                  {event.available_spots > 0 ? 'Записаться на событие' : 'Мест нет'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
