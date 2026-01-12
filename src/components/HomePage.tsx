import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { EventCard, Event } from './EventCard';

interface HomePageProps {
  events: Event[];
  bookingData: { name: string; phone: string; telegram: string };
  onBookingChange: (data: { name: string; phone: string; telegram: string }) => void;
  onSubmitBooking: () => void;
  onBookingClick: (event: Event) => void;
  onNavigateToEvents: () => void;
}

export const HomePage = ({ 
  events, 
  bookingData, 
  onBookingChange, 
  onSubmitBooking, 
  onBookingClick,
  onNavigateToEvents 
}: HomePageProps) => {
  return (
    <div className="animate-fade-in">
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${events[0].image})`,
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
            onClick={onNavigateToEvents}
          >
            Посмотреть события
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">Ближайшие события</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event, index) => (
            <div key={event.id} style={{ animationDelay: `${index * 150}ms` }}>
              <EventCard
                event={event}
                bookingData={bookingData}
                onBookingChange={onBookingChange}
                onSubmitBooking={onSubmitBooking}
                onBookingClick={onBookingClick}
              />
            </div>
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
  );
};
