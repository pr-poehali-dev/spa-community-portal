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
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: `url(${mockEvents[0].image})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
            🔥 Банное сообщество СПАРКОМ
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-gray-900 leading-tight">
            Погрузитесь в мир<br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              традиционных банных ритуалов
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-600 leading-relaxed">
            Присоединяйтесь к теплому кругу единомышленников. Аутентичные мероприятия, 
            опытные пармастера и лучшие бани Москвы.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/events">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Смотреть события
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold px-8 py-6 text-lg"
              >
                О сообществе
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">500+</div>
              <div className="text-sm text-gray-600">Участников</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-3xl font-bold text-amber-600 mb-1">50+</div>
              <div className="text-sm text-gray-600">Мероприятий</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">4.9</div>
              <div className="text-sm text-gray-600">Средний рейтинг</div>
            </div>
          </div>
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

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Icon name="Users" size={40} className="text-amber-600" />
              </div>
              <h4 className="text-2xl font-serif font-bold mb-3 text-gray-900">Тёплое сообщество</h4>
              <p className="text-gray-600 leading-relaxed">Присоединяйтесь к кругу единомышленников, разделяющих любовь к банным традициям и здоровому образу жизни</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Icon name="Award" size={40} className="text-amber-600" />
              </div>
              <h4 className="text-2xl font-serif font-bold mb-3 text-gray-900">Профессионализм</h4>
              <p className="text-gray-600 leading-relaxed">Опытные пармастера с многолетней практикой, сертификацией и глубоким знанием традиций</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Icon name="Flame" size={40} className="text-amber-600" />
              </div>
              <h4 className="text-2xl font-serif font-bold mb-3 text-gray-900">Аутентичность</h4>
              <p className="text-gray-600 leading-relaxed">Настоящие банные ритуалы в лучших банях Москвы с дровяными печами и традиционными вениками</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gray-900">
            Исследуйте сообщество
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Откройте для себя лучшие бани, познакомьтесь с мастерами и погрузитесь в мир традиций
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/bany">
            <Card className="h-full border-2 hover:border-amber-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader className="pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Icon name="Home" size={32} className="text-white" />
                </div>
                <CardTitle className="font-serif text-2xl mb-3 text-gray-900 group-hover:text-amber-700 transition-colors">
                  Бани-партнеры
                </CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Лучшие бани Москвы с проверенным качеством, традициями и современным комфортом
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/masters">
            <Card className="h-full border-2 hover:border-amber-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader className="pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Icon name="UserCheck" size={32} className="text-white" />
                </div>
                <CardTitle className="font-serif text-2xl mb-3 text-gray-900 group-hover:text-amber-700 transition-colors">
                  Профессиональные мастера
                </CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Сертифицированные пармастера с многолетним опытом и глубоким знанием традиций
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/blog">
            <Card className="h-full border-2 hover:border-amber-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-amber-50/30">
              <CardHeader className="pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Icon name="BookOpen" size={32} className="text-white" />
                </div>
                <CardTitle className="font-serif text-2xl mb-3 text-gray-900 group-hover:text-amber-700 transition-colors">
                  Банная энциклопедия
                </CardTitle>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Статьи о традициях, пользе для здоровья и искусстве банного мастерства
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