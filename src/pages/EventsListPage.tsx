import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { getEvents, getBaths, Event, Bath } from '@/lib/api';

const getTypeLabel = (type: string) => {
  switch(type) {
    case 'men': return 'Мужской';
    case 'women': return 'Женский';
    case 'mixed': return 'Совместный';
    default: return '';
  }
};

const getTypeBadgeColor = (type: string) => {
  switch(type) {
    case 'men': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'women': return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
    case 'mixed': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    default: return '';
  }
};

const EventsListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  
  const [filterType, setFilterType] = useState<'all' | 'men' | 'women' | 'mixed'>('all');
  const [filterBath, setFilterBath] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available'>('all');

  useEffect(() => {
    Promise.all([getEvents(), getBaths()])
      .then(([eventsData, bathsData]) => {
        setEvents(eventsData);
        setBaths(bathsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter(event => {
    if (filterType !== 'all' && event.type !== filterType) return false;
    if (filterBath !== 'all' && event.location !== filterBath) return false;
    if (filterAvailability === 'available' && event.available_spots === 0) return false;
    return true;
  });

  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const dateKey = event.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка событий...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Афиша событий</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Выберите подходящее мероприятие и присоединяйтесь к банному сообществу
      </p>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Icon name="Grid3x3" size={16} className="mr-2" />
            Сетка
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Icon name="Calendar" size={16} className="mr-2" />
            Календарь
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filterBath} onValueChange={setFilterBath}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все бани" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все бани</SelectItem>
              {baths.map(bath => (
                <SelectItem key={bath.id} value={bath.name}>{bath.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAvailability} onValueChange={(v) => setFilterAvailability(v as 'all' | 'available')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все события" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все события</SelectItem>
              <SelectItem value="available">Есть места</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button 
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          Все события
        </Button>
        <Button 
          variant={filterType === 'men' ? 'default' : 'outline'}
          onClick={() => setFilterType('men')}
        >
          Мужские
        </Button>
        <Button 
          variant={filterType === 'women' ? 'default' : 'outline'}
          onClick={() => setFilterType('women')}
        >
          Женские
        </Button>
        <Button 
          variant={filterType === 'mixed' ? 'default' : 'outline'}
          onClick={() => setFilterType('mixed')}
        >
          Совместные
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <Link to={`/events/${event.slug}`}>
                <div 
                  className="h-56 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${event.image_url})` }}
                >
                  <Badge className={`absolute top-4 right-4 ${getTypeBadgeColor(event.type)}`}>
                    {getTypeLabel(event.type)}
                  </Badge>
                  {event.available_spots === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg">Мест нет</Badge>
                    </div>
                  )}
                </div>
              </Link>
              <CardHeader>
                <Link to={`/events/${event.slug}`}>
                  <CardTitle className="font-serif text-xl hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </CardTitle>
                </Link>
                <CardDescription>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Calendar" size={16} />
                      <span>{new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="MapPin" size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{event.price} ₽</p>
                    <p className="text-sm text-muted-foreground">
                      {event.available_spots > 0 
                        ? `Осталось ${event.available_spots} из ${event.total_spots} мест`
                        : 'Мест нет'}
                    </p>
                  </div>
                  <Link to={`/events/${event.slug}`}>
                    <Button disabled={event.available_spots === 0}>
                      {event.available_spots > 0 ? 'Записаться' : 'Мест нет'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(eventsByDate)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, dateEvents]) => (
            <div key={date}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center min-w-[80px]">
                  <div className="text-3xl font-bold">
                    {new Date(date).getDate()}
                  </div>
                  <div className="text-sm">
                    {new Date(date).toLocaleDateString('ru-RU', { month: 'short' })}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold">
                    {new Date(date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <p className="text-muted-foreground">{dateEvents.length} {dateEvents.length === 1 ? 'событие' : 'события'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-24">
                {dateEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link to={`/events/${event.slug}`}>
                            <CardTitle className="font-serif text-lg hover:text-primary transition-colors line-clamp-1">
                              {event.title}
                            </CardTitle>
                          </Link>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={getTypeBadgeColor(event.type)} variant="secondary">
                              {getTypeLabel(event.type)}
                            </Badge>
                            {event.available_spots === 0 && (
                              <Badge variant="destructive">Мест нет</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-primary">{event.price} ₽</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Clock" size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="MapPin" size={16} />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Users" size={16} />
                          <span>{event.available_spots > 0 
                            ? `Осталось ${event.available_spots} из ${event.total_spots} мест`
                            : 'Мест нет'}</span>
                        </div>
                      </div>
                      <Link to={`/events/${event.slug}`}>
                        <Button className="w-full" disabled={event.available_spots === 0}>
                          {event.available_spots > 0 ? 'Записаться' : 'Мест нет'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Icon name="CalendarX" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">События не найдены</h3>
          <p className="text-muted-foreground">Попробуйте изменить фильтры</p>
        </div>
      )}
    </div>
  );
};

export default EventsListPage;