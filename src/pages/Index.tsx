import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'men' | 'women' | 'mixed';
  price: number;
  availableSpots: number;
  totalSpots: number;
  image: string;
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Традиционный мужской парной день',
    date: '2026-01-18',
    time: '14:00',
    location: 'Баня на Пресне',
    type: 'men',
    price: 1500,
    availableSpots: 3,
    totalSpots: 10,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg'
  },
  {
    id: 2,
    title: 'Женское wellness-парение',
    date: '2026-01-20',
    time: '16:00',
    location: 'Банный клуб Арбат',
    type: 'women',
    price: 1800,
    availableSpots: 5,
    totalSpots: 8,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg'
  },
  {
    id: 3,
    title: 'Совместный банный ритуал',
    date: '2026-01-25',
    time: '18:00',
    location: 'Баня у реки',
    type: 'mixed',
    price: 2000,
    availableSpots: 7,
    totalSpots: 12,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg'
  },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookingData, setBookingData] = useState({ name: '', phone: '', telegram: '' });
  const [filterType, setFilterType] = useState<'all' | 'men' | 'women' | 'mixed'>('all');

  const filteredEvents = filterType === 'all' 
    ? mockEvents 
    : mockEvents.filter(e => e.type === filterType);

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

  const handleBooking = (event: Event) => {
    setSelectedEvent(event);
  };

  const submitBooking = () => {
    console.log('Booking:', { event: selectedEvent, data: bookingData });
    alert('Заявка отправлена! Мы свяжемся с вами в Telegram для подтверждения.');
    setSelectedEvent(null);
    setBookingData({ name: '', phone: '', telegram: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">спарком.рф</h1>
            <div className="flex gap-2 md:gap-6">
              {['home', 'events', 'about', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`text-sm md:text-base font-medium transition-colors ${
                    activeSection === section ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'events' && 'События'}
                  {section === 'about' && 'О нас'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {activeSection === 'home' && (
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
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                onClick={() => setActiveSection('events')}
              >
                Посмотреть события
              </Button>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">Ближайшие события</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockEvents.slice(0, 3).map((event, index) => (
                <Card 
                  key={event.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image})` }}
                  />
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="font-serif text-xl">{event.title}</CardTitle>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => handleBooking(event)}>Записаться</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">{event.title}</DialogTitle>
                            <DialogDescription>
                              Заполните форму для записи на мероприятие
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="name">Имя</Label>
                              <Input 
                                id="name" 
                                value={bookingData.name}
                                onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                                placeholder="Ваше имя"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Телефон</Label>
                              <Input 
                                id="phone" 
                                value={bookingData.phone}
                                onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                                placeholder="+7 (999) 123-45-67"
                              />
                            </div>
                            <div>
                              <Label htmlFor="telegram">Telegram</Label>
                              <Input 
                                id="telegram" 
                                value={bookingData.telegram}
                                onChange={(e) => setBookingData({...bookingData, telegram: e.target.value})}
                                placeholder="@username"
                              />
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="text-sm font-medium mb-2">Детали бронирования:</p>
                              <p className="text-sm text-muted-foreground">
                                Дата: {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}<br/>
                                Стоимость: {event.price} ₽
                              </p>
                            </div>
                            <Button onClick={submitBooking} className="w-full">
                              Подтвердить запись
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
        </div>
      )}

      {activeSection === 'events' && (
        <div className="container mx-auto px-4 py-12 animate-fade-in">
          <h2 className="text-4xl font-serif font-bold text-center mb-8">Афиша событий</h2>
          
          <div className="flex justify-center gap-3 mb-8">
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
                <div 
                  className="h-56 bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.image})` }}
                />
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="font-serif text-xl">{event.title}</CardTitle>
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => handleBooking(event)}>Записаться</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-serif text-2xl">{event.title}</DialogTitle>
                          <DialogDescription>
                            Заполните форму для записи на мероприятие
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="name">Имя</Label>
                            <Input 
                              id="name" 
                              value={bookingData.name}
                              onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                              placeholder="Ваше имя"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Телефон</Label>
                            <Input 
                              id="phone" 
                              value={bookingData.phone}
                              onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                              placeholder="+7 (999) 123-45-67"
                            />
                          </div>
                          <div>
                            <Label htmlFor="telegram">Telegram</Label>
                            <Input 
                              id="telegram" 
                              value={bookingData.telegram}
                              onChange={(e) => setBookingData({...bookingData, telegram: e.target.value})}
                              placeholder="@username"
                            />
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Детали бронирования:</p>
                            <p className="text-sm text-muted-foreground">
                              Дата: {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}<br/>
                              Стоимость: {event.price} ₽
                            </p>
                          </div>
                          <Button onClick={submitBooking} className="w-full">
                            Подтвердить запись
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'about' && (
        <div className="container mx-auto px-4 py-12 animate-fade-in max-w-4xl">
          <h2 className="text-4xl font-serif font-bold text-center mb-8">О сообществе</h2>
          
          <div className="prose prose-lg mx-auto">
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-serif font-semibold mb-4">Наша миссия</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Мы создаём пространство, где люди могут познакомиться с аутентичными банными традициями, 
                  найти единомышленников и насладиться целебным эффектом качественного парения в дружелюбной атмосфере.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-serif font-semibold mb-4">Наши ценности</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span><strong>Доступность:</strong> Организуем шеринг-мероприятия, чтобы банные ритуалы были доступны каждому</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span><strong>Профессионализм:</strong> Работаем только с сертифицированными пармастерами</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span><strong>Комьюнити:</strong> Создаём теплую атмосферу, где каждый чувствует себя частью большой семьи</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span><strong>Традиции:</strong> Бережно храним и передаем знания о русских банных ритуалах</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-serif font-semibold mb-4">Как это работает</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">Выбираете событие</p>
                      <p className="text-sm text-muted-foreground">Находите подходящее мероприятие в афише</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-medium">Оставляете заявку</p>
                      <p className="text-sm text-muted-foreground">Заполняете простую форму с контактами</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-medium">Получаете подтверждение</p>
                      <p className="text-sm text-muted-foreground">Мы связываемся с вами в Telegram и высылаем детали</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <p className="font-medium">Наслаждаетесь парением</p>
                      <p className="text-sm text-muted-foreground">Приходите на мероприятие и погружаетесь в атмосферу</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSection === 'contacts' && (
        <div className="container mx-auto px-4 py-12 animate-fade-in max-w-2xl">
          <h2 className="text-4xl font-serif font-bold text-center mb-8">Контакты</h2>
          
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-serif font-semibold mb-4">Свяжитесь с нами</h3>
                <p className="text-muted-foreground mb-6">
                  Мы всегда рады ответить на ваши вопросы и помочь с организацией посещения
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Icon name="Send" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Telegram</p>
                    <a href="https://t.me/sparkomrf" className="text-primary hover:underline">@sparkomrf</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Icon name="Phone" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Телефон</p>
                    <a href="tel:+79991234567" className="text-primary hover:underline">+7 (999) 123-45-67</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Icon name="Mail" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:hello@sparkom.rf" className="text-primary hover:underline">hello@sparkom.rf</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Icon name="MapPin" size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Адрес</p>
                    <p className="text-muted-foreground">Москва, мероприятия проходят в разных банях города</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-3">График работы</h4>
                <p className="text-muted-foreground">Мероприятия проводятся еженедельно. Подробное расписание смотрите в разделе "События".</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2026 спарком.рф — Банное сообщество Москвы</p>
            <div className="flex gap-4">
              <a href="https://t.me/sparkomrf" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Send" size={20} />
              </a>
              <a href="tel:+79991234567" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Phone" size={20} />
              </a>
              <a href="mailto:hello@sparkom.rf" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Mail" size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
