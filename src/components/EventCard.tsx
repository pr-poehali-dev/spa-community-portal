import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export interface Event {
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

interface EventCardProps {
  event: Event;
  bookingData: { name: string; phone: string; telegram: string };
  onBookingChange: (data: { name: string; phone: string; telegram: string }) => void;
  onSubmitBooking: () => void;
  onBookingClick: (event: Event) => void;
}

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

export const EventCard = ({ event, bookingData, onBookingChange, onSubmitBooking, onBookingClick }: EventCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
              <Button onClick={() => onBookingClick(event)}>Записаться</Button>
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
                    onChange={(e) => onBookingChange({...bookingData, name: e.target.value})}
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input 
                    id="phone" 
                    value={bookingData.phone}
                    onChange={(e) => onBookingChange({...bookingData, phone: e.target.value})}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input 
                    id="telegram" 
                    value={bookingData.telegram}
                    onChange={(e) => onBookingChange({...bookingData, telegram: e.target.value})}
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
                <Button onClick={onSubmitBooking} className="w-full">
                  Подтвердить запись
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
