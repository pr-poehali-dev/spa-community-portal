import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { getEvents, Event } from '@/lib/api';

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
    case 'male': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'female': return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
    case 'mixed': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    default: return '';
  }
};

const EventsListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'male' | 'female' | 'mixed'>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available'>('all');
  const [sort, setSort] = useState<'date' | 'price_asc' | 'price_desc'>('date');

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      if (isMounted) setLoading(true);
      try {
        const filters: any = {
          sort: sort
        };
        
        if (filterType !== 'all') {
          filters.gender_type = filterType;
        }
        
        if (filterCity !== 'all') {
          filters.city = filterCity;
        }
        
        if (filterAvailability === 'available') {
          filters.available_only = true;
        }
        
        const data = await getEvents(filters);
        if (isMounted) setEvents(data.items || []);
      } catch (error) {
        if (isMounted) console.error('Failed to load events:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [filterType, filterCity, filterAvailability, sort]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Дата уточняется';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
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
          <p className="text-muted-foreground">Загрузка событий...</p>
        </div>
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
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все города" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все города</SelectItem>
              <SelectItem value="Москва">Москва</SelectItem>
              <SelectItem value="Санкт-Петербург">Санкт-Петербург</SelectItem>
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

          <Select value={sort} onValueChange={(v) => setSort(v as 'date' | 'price_asc' | 'price_desc')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="price_asc">Сначала дешевые</SelectItem>
              <SelectItem value="price_desc">Сначала дорогие</SelectItem>
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
          variant={filterType === 'male' ? 'default' : 'outline'}
          onClick={() => setFilterType('male')}
        >
          Мужские
        </Button>
        <Button 
          variant={filterType === 'female' ? 'default' : 'outline'}
          onClick={() => setFilterType('female')}
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

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Calendar" className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Событий не найдено</h3>
          <p className="text-muted-foreground">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const imageUrl = getImageUrl(event);
            const hasSpots = event.available_spots > 0;
            
            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link to={`/events/${event.slug}`}>
                  <div 
                    className="h-56 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  >
                    <Badge className={`absolute top-4 right-4 ${getTypeBadgeColor(event.gender_type)}`}>
                      {getTypeLabel(event.gender_type)}
                    </Badge>
                    {!hasSpots && (
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
                        <span>{formatDate(event.nearest_datetime)}</span>
                      </div>
                      {event.bathhouse && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="MapPin" size={16} />
                          <span>{event.bathhouse.name}</span>
                        </div>
                      )}
                      {event.city && !event.bathhouse && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="MapPin" size={16} />
                          <span>{event.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Clock" size={16} />
                        <span>{event.duration_minutes} минут</span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{event.price} ₽</p>
                      <p className="text-sm text-muted-foreground">
                        {hasSpots 
                          ? `Свободно мест: ${event.available_spots}`
                          : 'Мест нет'}
                      </p>
                      {event.schedules_count > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.schedules_count} {event.schedules_count === 1 ? 'дата' : 'даты'}
                        </p>
                      )}
                    </div>
                    <Link to={`/events/${event.slug}`}>
                      <Button disabled={!hasSpots}>
                        {hasSpots ? 'Записаться' : 'Мест нет'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsListPage;