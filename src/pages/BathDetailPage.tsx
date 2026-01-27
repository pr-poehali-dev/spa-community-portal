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
import { getBathBySlug, Bath } from '@/lib/api';

const BathDetailPage = () => {
  const { slug } = useParams();
  const [bath, setBath] = useState<Bath | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    telegram: '',
    date: '',
    time: '',
    duration: '3',
    guests: '',
    message: ''
  });

  useEffect(() => {
    if (slug) {
      getBathBySlug(slug)
        .then(data => setBath(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleBooking = () => {
    console.log('Booking bath:', { bath, data: bookingData });
    alert('Заявка отправлена! Мы свяжемся с вами для подтверждения.');
    setBookingData({ name: '', phone: '', telegram: '', date: '', time: '', duration: '3', guests: '', message: '' });
    setDialogOpen(false);
  };

  const nextImage = () => {
    if (bath) {
      setCurrentImageIndex((prev) => (prev + 1) % bath.images.length);
    }
  };

  const prevImage = () => {
    if (bath) {
      setCurrentImageIndex((prev) => (prev - 1 + bath.images.length) % bath.images.length);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }
  
  if (!bath) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="animate-fade-in">
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${bath.images[currentImageIndex]})` }}
      >
        {bath.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              aria-label="Предыдущее фото"
            >
              <Icon name="ChevronLeft" size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              aria-label="Следующее фото"
            >
              <Icon name="ChevronRight" size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {bath.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Фото ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Link to="/bany" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к баням</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {bath.name}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-white">
              <div className="flex items-center gap-2">
                <Icon name="Star" size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{bath.rating}</span>
                <span className="text-white/80">({bath.reviews_count} отзывов)</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={20} />
                <span>{bath.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Users" size={20} />
                <span>До {bath.capacity} человек</span>
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
                <CardTitle className="font-serif text-2xl">О бане</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {bath.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Характеристики</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Icon name="Users" size={24} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Вместимость</p>
                      <p className="font-semibold">До {bath.capacity} человек</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Icon name="DollarSign" size={24} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Стоимость</p>
                      <p className="font-semibold">{bath.price_per_hour} ₽/час</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Icon name="Star" size={24} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Рейтинг</p>
                      <p className="font-semibold">{bath.rating} ({bath.reviews_count} отзывов)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Icon name="MapPin" size={24} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Район</p>
                      <p className="font-semibold">{bath.address.split(',')[0]}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Особенности и удобства</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bath.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Icon name="Check" size={20} className="text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Правила посещения</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Минимальное время аренды — 2 часа</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Запрещено курение в помещении</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Необходимо иметь с собой простыни и тапочки</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Посещение детей только в сопровождении взрослых</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">При опоздании более 15 минут бронь может быть аннулирована</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Отзывы гостей</CardTitle>
                <CardDescription>Что говорят посетители о бане</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Александр</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Отличная традиционная баня! Дровяная печь создаёт неповторимую атмосферу. 
                        Персонал дружелюбный, всё чисто и ухожено.
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
                        <p className="font-semibold">Мария</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ходим сюда всей семьёй уже несколько лет. Идеальное сочетание цены и качества.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Бронирование</CardTitle>
                <CardDescription>Забронируйте баню для вашей компании</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Стоимость:</span>
                    <span className="text-2xl font-bold text-primary">{bath.price_per_hour} ₽/час</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Вместимость:</span>
                    <span>До {bath.capacity} человек</span>
                  </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Забронировать баню
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">Бронирование {bath.name}</DialogTitle>
                      <DialogDescription>
                        Заполните форму для бронирования
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="date">Дата *</Label>
                          <Input 
                            id="date" 
                            type="date"
                            value={bookingData.date}
                            onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Время *</Label>
                          <Input 
                            id="time" 
                            type="time"
                            value={bookingData.time}
                            onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="duration">Часов *</Label>
                          <select
                            id="duration"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={bookingData.duration}
                            onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                          >
                            <option value="2">2 часа</option>
                            <option value="3">3 часа</option>
                            <option value="4">4 часа</option>
                            <option value="5">5 часов</option>
                            <option value="6">6 часов</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="guests">Гостей *</Label>
                          <Input 
                            id="guests" 
                            type="number"
                            value={bookingData.guests}
                            onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
                            placeholder="6"
                            min="1"
                            max={bath.capacity}
                          />
                        </div>
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
                        <p className="text-sm font-medium mb-2">Итого:</p>
                        <p className="text-sm text-muted-foreground">
                          Баня: {bath.name}<br/>
                          {bookingData.duration && `Продолжительность: ${bookingData.duration} час${bookingData.duration === '1' ? '' : bookingData.duration === '2' || bookingData.duration === '3' || bookingData.duration === '4' ? 'а' : 'ов'}`}<br/>
                          {bookingData.duration && (
                            <span className="text-primary font-semibold">
                              Стоимость: {bath.price_per_hour * parseInt(bookingData.duration)} ₽
                            </span>
                          )}
                        </p>
                      </div>
                      <Button 
                        onClick={handleBooking} 
                        className="w-full"
                        disabled={!bookingData.name || !bookingData.phone || !bookingData.date || !bookingData.time || !bookingData.guests}
                      >
                        Подтвердить бронь
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BathDetailPage;