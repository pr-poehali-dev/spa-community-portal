import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { getEventBySlug, createBooking, Event } from '@/lib/api';

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
    case 'men': return 'bg-blue-100 text-blue-800';
    case 'women': return 'bg-pink-100 text-pink-800';
    case 'mixed': return 'bg-purple-100 text-purple-800';
    default: return '';
  }
};

const EventDetailPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({ name: '', phone: '', telegram: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      getEventBySlug(slug)
        .then(data => setEvent(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const submitBooking = async () => {
    if (!event || !bookingData.name || !bookingData.phone) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        event_id: event.id,
        name: bookingData.name,
        phone: bookingData.phone,
        telegram: bookingData.telegram
      });
      alert('Заявка отправлена! Мы свяжемся с вами в Telegram для подтверждения.');
      setBookingData({ name: '', phone: '', telegram: '' });
      setDialogOpen(false);
      
      if (slug) {
        getEventBySlug(slug).then(data => setEvent(data));
      }
    } catch (error) {
      alert('Ошибка при отправке заявки. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }
  
  if (!event) {
    return <Navigate to="/404" replace />;
  };

  return (
    <div className="animate-fade-in">
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${event.image_url})`,
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
              <Badge className={`${getTypeBadgeColor(event.type)} text-base`}>
                {getTypeLabel(event.type)}
              </Badge>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                <span>{new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={20} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {event.program && event.program.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Программа мероприятия</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            {event.rules && event.rules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Правила участия</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {event.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Запись на событие</CardTitle>
                <CardDescription>Заполните форму для бронирования</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Стоимость:</span>
                    <span className="text-2xl font-bold text-primary">{event.price} ₽</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Всего мест:</span>
                    <span>{event.totalSpots}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Свободно:</span>
                    <span className="font-medium text-primary">{event.available_spots}</span>
                  </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={event.available_spots === 0}
                    >
                      {event.available_spots > 0 ? 'Записаться на мероприятие' : 'Мест нет'}
                    </Button>
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
                      <Button 
                        onClick={submitBooking} 
                        className="w-full"
                        disabled={isSubmitting || !bookingData.name || !bookingData.phone}
                      >
                        {isSubmitting ? 'Отправка...' : 'Подтвердить запись'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <p className="text-xs text-muted-foreground text-center">
                  После отправки заявки мы свяжемся с вами в Telegram
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