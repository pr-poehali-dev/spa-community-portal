import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { getMasterBySlug, Master } from '@/lib/api';

const MasterDetailPage = () => {
  const { slug } = useParams();
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    telegram: '',
    service: '',
    date: '',
    message: ''
  });

  useEffect(() => {
    if (slug) {
      getMasterBySlug(slug)
        .then(data => setMaster(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleBooking = () => {
    console.log('Booking master:', { master, data: bookingData });
    alert('Заявка отправлена! Мы свяжемся с вами для подтверждения.');
    setBookingData({ name: '', phone: '', telegram: '', service: '', date: '', message: '' });
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }
  
  if (!master) {
    return <Navigate to="/404" replace />;
  };

  return (
    <div className="animate-fade-in">
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${master.avatar_url})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Link to="/masters" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к мастерам</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {master.name}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-white">
              <Badge className="bg-primary/90 hover:bg-primary text-white">{master.specialization}</Badge>
              <div className="flex items-center gap-2">
                <Icon name="Star" size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{master.rating}</span>
                <span className="text-white/80">({master.reviews_count} отзывов)</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Award" size={20} />
                <span>{master.experience} лет опыта</span>
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
                <CardTitle className="font-serif text-2xl">О мастере</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {master.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Услуги и цены</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {master.services.map((service, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.duration} минут</p>
                        </div>
                        <p className="text-xl font-bold text-primary">{service.price} ₽</p>
                      </div>
                      {index < master.services.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Философия мастера</CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                  "Баня — это не просто мытьё, это ритуал очищения тела и души. 
                  Каждый сеанс — это уникальное путешествие, где тепло, пар и традиции 
                  соединяются в гармонии."
                </blockquote>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  С уважением к древним традициям и современным подходом к здоровью.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Отзывы клиентов</CardTitle>
                <CardDescription>Что говорят о работе мастера</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Дмитрий</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Профессионал своего дела! Чувствуется многолетний опыт. 
                        Парение было очень мягким и эффективным. Обязательно вернусь!
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Анна</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Замечательный мастер! Внимательный, деликатный, знает своё дело на отлично.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Всего отзывов: {master.reviews_count}</p>
                    <Button variant="outline" size="sm">Показать все отзывы</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Запись к мастеру</CardTitle>
                <CardDescription>Выберите удобное время для сеанса</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium mb-2">Стоимость услуг:</p>
                  {master.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{service.name}</span>
                      <span className="font-semibold">{service.price} ₽</span>
                    </div>
                  ))}
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Записаться к мастеру
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">Запись к {master.name}</DialogTitle>
                      <DialogDescription>
                        Заполните форму для бронирования сеанса
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="name">Имя *</Label>
                        <Input 
                          id="name" 
                          value={bookingData.name}
                          onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                          placeholder="Ваше имя"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Телефон *</Label>
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
                      <div>
                        <Label htmlFor="service">Услуга *</Label>
                        <select
                          id="service"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={bookingData.service}
                          onChange={(e) => setBookingData({...bookingData, service: e.target.value})}
                        >
                          <option value="">Выберите услугу</option>
                          {master.services.map((service, index) => (
                            <option key={index} value={service.name}>
                              {service.name} - {service.price} ₽ ({service.duration} мин)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="date">Желаемая дата *</Label>
                        <Input 
                          id="date" 
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Комментарий</Label>
                        <Textarea 
                          id="message" 
                          value={bookingData.message}
                          onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                          placeholder="Дополнительные пожелания"
                          rows={3}
                        />
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm font-medium mb-2">Детали бронирования:</p>
                        <p className="text-sm text-muted-foreground">
                          Мастер: {master.name}<br/>
                          {bookingData.service && `Услуга: ${bookingData.service}`}
                        </p>
                      </div>
                      <Button 
                        onClick={handleBooking} 
                        className="w-full"
                        disabled={!bookingData.name || !bookingData.phone || !bookingData.service || !bookingData.date}
                      >
                        Подтвердить запись
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Контакты</h4>
                  <a href="tel:+79991234567" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="Phone" size={16} />
                    <span>+7 (999) 123-45-67</span>
                  </a>
                  <a href="https://t.me/sparkomrf" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="Send" size={16} />
                    <span>@sparkomrf</span>
                  </a>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <Icon name="Info" size={16} className="inline mr-1" />
                    Рекомендуем записываться заранее — у мастера высокая загрузка
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDetailPage;