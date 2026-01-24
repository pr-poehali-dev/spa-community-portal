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

const Home = () => {
  return (
    <div className="animate-fade-in">
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${mockEvents[0].image})`,
            filter: 'brightness(0.6)'
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 animate-scale-in">
            Тёплый круг единомышленников
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к сообществу любителей банных традиций. Открытые мероприятия, профессиональные мастера и дружелюбная атмосфера.
          </p>
          <Link to="/events">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              Посмотреть события
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-12">
          <h3 className="text-3xl md:text-4xl font-serif font-bold">Ближайшие события</h3>
          <Link to="/events">
            <Button variant="outline">
              Все события
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockEvents.slice(0, 3).map((event, index) => (
            <Card 
              key={event.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Link to={`/events/${event.slug}`}>
                <div 
                  className="h-48 bg-cover bg-center"
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
                    <Button>Подробнее</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Icon name="Users" size={32} className="text-primary" />
              </div>
              <h4 className="text-xl font-serif font-semibold mb-2">Сообщество</h4>
              <p className="text-muted-foreground">Теплый круг единомышленников, разделяющих любовь к банным традициям</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Icon name="Heart" size={32} className="text-primary" />
              </div>
              <h4 className="text-xl font-serif font-semibold mb-2">Профессионализм</h4>
              <p className="text-muted-foreground">Опытные пармастера с многолетней практикой и сертификацией</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Icon name="Flame" size={32} className="text-primary" />
              </div>
              <h4 className="text-xl font-serif font-semibold mb-2">Традиции</h4>
              <p className="text-muted-foreground">Аутентичные банные ритуалы в лучших банях Москвы</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">Исследуйте сообщество</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/bany">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Icon name="Home" size={24} className="text-primary" />
                </div>
                <CardTitle className="font-serif">Бани-партнеры</CardTitle>
                <CardDescription>
                  Лучшие бани Москвы с проверенным качеством и традициями
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/masters">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Icon name="UserCheck" size={24} className="text-primary" />
                </div>
                <CardTitle className="font-serif">Мастера</CardTitle>
                <CardDescription>
                  Профессиональные пармастера с многолетним опытом
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/blog">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <Icon name="BookOpen" size={24} className="text-primary" />
                </div>
                <CardTitle className="font-serif">Банная энциклопедия</CardTitle>
                <CardDescription>
                  Статьи о традициях, здоровье и искусстве парения
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
