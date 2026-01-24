import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { mockEvents } from '@/data/mockData';

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
  const [filterType, setFilterType] = useState<'all' | 'men' | 'women' | 'mixed'>('all');

  const filteredEvents = filterType === 'all' 
    ? mockEvents 
    : mockEvents.filter(e => e.type === filterType);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Афиша событий</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Выберите подходящее мероприятие и присоединяйтесь к банному сообществу
      </p>
      
      <div className="flex justify-center gap-3 mb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/events/${event.slug}`}>
              <div 
                className="h-56 bg-cover bg-center"
                style={{ backgroundImage: `url(${event.image})` }}
              />
            </Link>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Link to={`/events/${event.slug}`}>
                  <CardTitle className="font-serif text-xl hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                </Link>
                <Badge className={getTypeBadgeColor(event.type)}>
                  {getTypeLabel(event.type)}
                </Badge>
              </div>
              <CardDescription>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={16} />
                    <span>{new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                  <p className="text-sm text-muted-foreground">Осталось мест: {event.availableSpots}</p>
                </div>
                <Link to={`/events/${event.slug}`}>
                  <Button>Записаться</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsListPage;
