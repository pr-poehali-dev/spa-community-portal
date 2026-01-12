import { Button } from '@/components/ui/button';
import { EventCard, Event } from './EventCard';

interface EventsPageProps {
  events: Event[];
  filterType: 'all' | 'men' | 'women' | 'mixed';
  onFilterChange: (type: 'all' | 'men' | 'women' | 'mixed') => void;
  bookingData: { name: string; phone: string; telegram: string };
  onBookingChange: (data: { name: string; phone: string; telegram: string }) => void;
  onSubmitBooking: () => void;
  onBookingClick: (event: Event) => void;
}

export const EventsPage = ({ 
  events, 
  filterType, 
  onFilterChange, 
  bookingData, 
  onBookingChange, 
  onSubmitBooking, 
  onBookingClick 
}: EventsPageProps) => {
  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h2 className="text-4xl font-serif font-bold text-center mb-8">Афиша событий</h2>
      
      <div className="flex justify-center gap-3 mb-8">
        <Button 
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => onFilterChange('all')}
        >
          Все события
        </Button>
        <Button 
          variant={filterType === 'men' ? 'default' : 'outline'}
          onClick={() => onFilterChange('men')}
        >
          Мужские
        </Button>
        <Button 
          variant={filterType === 'women' ? 'default' : 'outline'}
          onClick={() => onFilterChange('women')}
        >
          Женские
        </Button>
        <Button 
          variant={filterType === 'mixed' ? 'default' : 'outline'}
          onClick={() => onFilterChange('mixed')}
        >
          Совместные
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            bookingData={bookingData}
            onBookingChange={onBookingChange}
            onSubmitBooking={onSubmitBooking}
            onBookingClick={onBookingClick}
          />
        ))}
      </div>
    </div>
  );
};
