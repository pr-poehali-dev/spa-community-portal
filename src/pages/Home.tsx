import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventFilter, setEventFilter] = useState<'all' | 'male' | 'female' | 'mixed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filters = eventFilter === 'all' ? {} : { gender_type: eventFilter };
    getEvents(filters)
      .then(data => setEvents(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventFilter]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg)`,
            filter: 'brightness(0.5)'
          }}
        />
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-scale-in">
            Тёплый круг. Настоящий пар.<br/>Ваше сообщество.
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">Собираем единомышленников в лучших банях Москвы. аренда в складчину, экспертные мастера и душевная атмосфера.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://t.me/sparkomrf" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg">
                <Icon name="Send" size={20} className="mr-2" />
                Вступить в сообщество
              </Button>
            </a>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg"
              onClick={() => scrollToSection('how-it-works')}
            >
              Как это работает?
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">
            Баня становится лучше, когда ты не один
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            В чём ценность СПАРКОМа?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <Icon name="Users" size={32} className="text-primary" />
                </div>
                <CardTitle className="font-serif text-xl mb-2">Доступность</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Шеринг аренды. Делим стоимость аренды на компанию — баня становится доступной каждому
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <Icon name="Heart" size={32} className="text-primary" />
                </div>
                <CardTitle className="font-serif text-xl mb-2">Сообщество</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Тёплый круг. Знакомься с интересными людьми, разделяющими любовь к банным традициям
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <Icon name="Flame" size={32} className="text-primary" />
                </div>
                <CardTitle className="font-serif text-xl mb-2">Экспертиза</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Мастера и ритуалы. Парься с лучшими пармастерами Москвы, обучайся традициям
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                  <Icon name="Sparkles" size={32} className="text-primary" />
                </div>
                <CardTitle className="font-serif text-xl mb-2">Удобство</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Всё в одном месте. Выбирай баню, записывайся на события, общайся — всё онлайн
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="mb-6 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                Ближайшие банные четверги
              </h2>
              <p className="text-muted-foreground text-lg">(и другие встречи)</p>
            </div>
            <Link to="/events">
              <Button variant="outline" size="lg">
                Вся афиша
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <Button 
              variant={eventFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setEventFilter('all')}
            >
              Все события
            </Button>
            <Button 
              variant={eventFilter === 'male' ? 'default' : 'outline'}
              onClick={() => setEventFilter('male')}
            >
              Мужские
            </Button>
            <Button 
              variant={eventFilter === 'female' ? 'default' : 'outline'}
              onClick={() => setEventFilter('female')}
            >
              Женские
            </Button>
            <Button 
              variant={eventFilter === 'mixed' ? 'default' : 'outline'}
              onClick={() => setEventFilter('mixed')}
            >
              Совместные
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Загрузка событий...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event, index) => (
                <Card 
                  key={event.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <Link to={`/events/${event.slug}`}>
                    <div 
                      className="h-56 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'})` }}
                    >
                      <Badge className={`absolute top-4 right-4 ${getTypeBadgeColor(event.gender_type)}`}>
                        {getTypeLabel(event.gender_type)}
                      </Badge>
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
                        {event.nearest_datetime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="Calendar" size={16} />
                            <span>{new Date(event.nearest_datetime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        {event.bathhouse && (
                          <div className="flex items-center gap-2 text-sm">
                            <Icon name="MapPin" size={16} />
                            <span>{event.bathhouse.name}</span>
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-3xl font-bold text-primary">{event.price} ₽</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.available_spots > 0 ? `Осталось ${event.available_spots} мест` : 'Мест нет'}
                        </p>
                      </div>
                      <Link to={`/events/${event.slug}`}>
                        <Button>Подробнее</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-16">
            Исследуй мир СПАРКОМа
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/bany" className="group">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full border-2 border-transparent hover:border-primary">
                <CardHeader className="text-center pb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon name="Home" size={32} className="text-primary" />
                  </div>
                  <CardTitle className="font-serif text-2xl mb-4">Каталог бань</CardTitle>
                  <CardDescription className="text-base">
                    Лучшие бани Москвы с проверенным качеством и традициями. Выбирай и бронируй онлайн
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Link to="/masters" className="group">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full border-2 border-transparent hover:border-primary">
                <CardHeader className="text-center pb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon name="UserCheck" size={32} className="text-primary" />
                  </div>
                  <CardTitle className="font-serif text-2xl mb-4">Мастера</CardTitle>
                  <CardDescription className="text-base">
                    Профессиональные пармастера с многолетним опытом и сертификацией. Запись онлайн
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Link to="/blog" className="group">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full border-2 border-transparent hover:border-primary">
                <CardHeader className="text-center pb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon name="BookOpen" size={32} className="text-primary" />
                  </div>
                  <CardTitle className="font-serif text-2xl mb-4">Банная энциклопедия</CardTitle>
                  <CardDescription className="text-base">
                    Статьи о традициях, здоровье и искусстве парения. Обучайся у лучших
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Попасть в нашу баню — легко</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">
            Всего 4 шага отделяют тебя от качественного пара
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                  1
                </div>
                <div className="hidden md:block absolute top-1/2 left-[calc(50%+48px)] w-[calc(100%+32px)] h-0.5 bg-primary/20" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Регистрация в Telegram</h3>
              <p className="text-muted-foreground">
                Подпишись на наш канал и присоединись к чату сообщества
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                  2
                </div>
                <div className="hidden md:block absolute top-1/2 left-[calc(50%+48px)] w-[calc(100%+32px)] h-0.5 bg-primary/20" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Выбор события/бани</h3>
              <p className="text-muted-foreground">
                Найди подходящее мероприятие в афише или выбери баню для аренды
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                  3
                </div>
                <div className="hidden md:block absolute top-1/2 left-[calc(50%+48px)] w-[calc(100%+32px)] h-0.5 bg-primary/20" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Онлайн-запись</h3>
              <p className="text-muted-foreground">
                Заполни простую форму — мы подтвердим бронь в Telegram
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                  4
                </div>
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Посещение</h3>
              <p className="text-muted-foreground">
                Приходи, наслаждайся паром и знакомься с новыми людьми
              </p>
            </div>
          </div>
        </div>
      </section>

      <section 
        className="relative py-32 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg)`
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Готов присоединиться к кругу?
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto">
            Больше 500 человек уже нашли здесь своих банных друзей
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://t.me/sparkomrf" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-6 text-lg">
                <Icon name="Send" size={20} className="mr-2" />
                Вступить в сообщество
              </Button>
            </a>
            <a href="https://t.me/sparkomrf" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold px-10 py-6 text-lg"
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                У меня есть вопрос
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;